import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IPostFilterRequest } from "./bloodPost.interface";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";
import { postSearchableFields } from "./bloodPost.constant";

const createPostForBlood = async (token: string, payload: any) => {
  const {
    numberOfBags,
    phoneNumber,
    dateOfDonation,
    hospitalName,
    hospitalLocation,
    hospitalAddress,
    reason,
  } = payload;

  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the requester is available in database: check if the requesterId is valid
  const requesterData = await prisma.user.findUniqueOrThrow({
    where: {
      email: isTokenValid.email,
    },
  });

  if (!requesterData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Please try again.."
    );
  }

  const postInfo = {
    // donorId: payload?.donorId,
    requesterId: requesterData?.id,
    numberOfBags,
    phoneNumber,
    dateOfDonation,
    hospitalName,
    hospitalLocation,
    hospitalAddress,
    reason,
  };

  const createdPostData = await prisma.bloodPost.create({
    data: postInfo,
  });

  return createdPostData;
};

const getAllBloodPostFromDB = async (
  params: IPostFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const andConditions: Prisma.BloodPostWhereInput[] = [];

  const { searchTerm, ...filterData } = params;

  if (searchTerm) {
    andConditions.push({
      OR: postSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
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

  // Always add the isManaged: false condition
  andConditions.push({
    isManaged: false,
  });

  const whereConditions: Prisma.BloodPostWhereInput = { AND: andConditions };

  const posts = await prisma.bloodPost.findMany({
    where: whereConditions,
    include: {
      requester: true,
      acceptedDonors: {
        include: {
          donor: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : { createdAt: "desc" },
  });

  const total = await prisma.bloodPost.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: posts,
  };
};

const acceptPostByDonorIntoDB = async (token: string, payload: any) => {
  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the requester is available in database: check if the requesterId is valid
  const donorData = await prisma.user.findUniqueOrThrow({
    where: {
      email: isTokenValid.email,
    },
  });

  if (!donorData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Please try again.."
    );
  }

  const postInfo = {
    donorId: donorData?.id,
    bloodPostId: payload?.bloodPostId,
  };

  // Start a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Create the accepted donor record
    const acceptedPostData = await prisma.bloodPostDonor.create({
      data: postInfo,
    });

    // Check if the number of accepted donors matches the number of bags: It actually count the total number of record for a specific post id
    const donorCount = await prisma.bloodPostDonor.count({
      where: {
        bloodPostId: payload.bloodPostId,
      },
    });

    const bloodPost = await prisma.bloodPost.findUnique({
      where: {
        id: payload.bloodPostId,
      },
    });

    if (!bloodPost) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "BloodPost not found! Please try again.."
      );
    }

    if (donorCount === bloodPost.numberOfBags) {
      // Update the BloodPost to set isManaged to true
      await prisma.bloodPost.update({
        where: {
          id: payload.bloodPostId,
        },
        data: {
          isManaged: true,
        },
      });
    }

    return acceptedPostData;
  });

  return result;
};

const deleteAcceptedPostFormDB = async (token: string, postId: string) => {
  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the donor is available in the database
  const donorData = await prisma.user.findUniqueOrThrow({
    where: {
      email: isTokenValid.email,
    },
  });

  if (!donorData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Please try again.."
    );
  }

  // Start a transaction
  const result = await prisma.$transaction(async (prisma) => {
    // Delete the accepted donor record
    const deletedAcceptPost = await prisma.bloodPostDonor.deleteMany({
      where: {
        bloodPostId: postId,
        donorId: donorData.id,
      },
    });

    if (deletedAcceptPost.count === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Acceptance record not found!");
    }

    // Check the number of remaining accepted donors
    const donorCount = await prisma.bloodPostDonor.count({
      where: {
        bloodPostId: postId,
      },
    });

    const bloodPost = await prisma.bloodPost.findUnique({
      where: {
        id: postId,
      },
    });

    if (!bloodPost) {
      throw new ApiError(httpStatus.NOT_FOUND, "BloodPost not found!");
    }

    // Update the BloodPost to set isManaged to false if needed
    if (donorCount < bloodPost.numberOfBags) {
      await prisma.bloodPost.update({
        where: {
          id: postId,
        },
        data: {
          isManaged: false,
        },
      });
    }

    return deletedAcceptPost;
  });

  return result;
};

const getSingleBloodPostFromDB = async (id: string) => {
  const result = await prisma.bloodPost.findUnique({
    where: {
      id,
      isManaged: false,
    },
    include: {
      requester: true,
      acceptedDonors: {
        include: {
          donor: true,
        },
      },
    },
  });
  return result;
};

export const PostServices = {
  createPostForBlood,
  getAllBloodPostFromDB,
  acceptPostByDonorIntoDB,
  deleteAcceptedPostFormDB,
  getSingleBloodPostFromDB,
};
