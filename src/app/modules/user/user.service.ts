import bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { IDonorFilterRequest } from "./user.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { donorSearchableFields } from "./user.constant";
import jwtError from "../../errors/JwtError";

/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */

const createUserIntoDB = async (data: any) => {
  const hashedPassword: string = await bcrypt.hash(data.password, 12);

  const userData = {
    name: data.name,
    email: data.email,
    role: UserRole.USER,
    password: hashedPassword,
    bloodType: data.bloodType,
    location: data.location,
    availability: data.availability,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    // Operation-1
    const createdUserData = await transactionClient.user.create({
      data: userData,
    });
    // Operation-2
    const createdProfileData = await transactionClient.userProfile.create({
      data: {
        bio: (data.bio as string) || "",
        age: data.age as number,
        profileImage: data.profileImage as string,
        lastDonationDate: data.lastDonationDate as string,
        userId: createdUserData.id as string,
      },
    });

    const { password, ...userDataWithoutPassword } = createdUserData;

    // Combine user data and user profile data
    const userDataWithProfile = {
      ...userDataWithoutPassword,
      userProfile: createdProfileData,
    };

    return userDataWithProfile;
  });

  return result;
};

const getMyProfileFromDB = async (token: string) => {
  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new jwtError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the user is available in database
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: isTokenValid.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      location: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      userProfile: {
        select: {
          id: true,
          userId: true,
          bio: true,
          age: true,
          profileImage: true,
          lastDonationDate: true,
          height: true,
          weight: true,
          gender: true,
          hasAllergies: true,
          hasDiabetes: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return userData;
};

const updateMyProfileIntoDB = async (token: string, payload: any) => {
  const { bloodType, location, name, email, availability, ...userProfileData } =
    payload;

  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the user is available in database
  const userData = await prisma.user.findUnique({
    where: {
      email: isTokenValid.email,
    },
  });

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Please try again.."
    );
  }

  // update the user profile
  // const updatedData = await prisma.userProfile.update({
  //   where: {
  //     userId: userData.id,
  //   },
  //   data: payload,
  // });

  const result = await prisma.$transaction(async (transactionClient) => {
    const updateUserData = await transactionClient.user.update({
      where: { id: userData.id },
      data: { bloodType, location, name, email, availability },
    });

    const updateProfileData = await transactionClient.userProfile.upsert({
      where: { userId: userData.id }, // Use userId for the unique condition
      update: userProfileData, // Update if already exists
      create: {
        age: userProfileData.age,
        bio: userProfileData.bio,
        gender: userProfileData.gender,
        hasAllergies: userProfileData.hasAllergies,
        hasDiabetes: userProfileData.hasDiabetes,
        height: userProfileData.height,
        lastDonationDate: userProfileData.lastDonationDate,
        phoneNumber: userProfileData.phoneNumber,
        weight: userProfileData.weight,
        user: {
          connect: { id: userData.id }, // Connect the existing user
        },
      },
    });

    return updateProfileData;
  });

  return result;
};

// Get all donors
const getAllDonors = async (
  params: IDonorFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const andConditions: Prisma.UserWhereInput[] = [];

  const { searchTerm, availability, ...filterData } = params;

  if (searchTerm) {
    andConditions.push({
      OR: donorSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Add filter for availability if it's specified in params
  if (availability !== undefined) {
    andConditions.push({
      availability: availability === "false" ? false : true,
    });
  }

  //   Implementing Filtering On Specific Fields And Values
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput = { AND: andConditions };

  const result = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeStatus: true,
      bloodType: true,
      location: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      userProfile: {
        select: {
          id: true,
          userId: true,
          bio: true,
          age: true,
          profileImage: true,
          lastDonationDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy === "age" || options.sortBy === "lastDonationDate"
        ? {
            userProfile: {
              [sortBy]: options.sortOrder,
            },
          }
        : options.sortBy && options.sortBy
        ? { [sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: {
      id,
      // isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      bloodType: true,
      location: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      userProfile: {
        select: {
          id: true,
          userId: true,
          bio: true,
          age: true,
          lastDonationDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  return result;
};

const updateUserInfoIntoDB = async (
  id: string,
  updateData: { role?: UserRole; activeStatus?: UserStatus }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: updateData,
  });

  return updateUserStatus;
};

export const UserServices = {
  createUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileIntoDB,
  getAllDonors,
  getByIdFromDB,
  updateUserInfoIntoDB,
};
