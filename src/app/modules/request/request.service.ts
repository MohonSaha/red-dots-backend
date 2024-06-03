import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { IRequestFilterRequest } from "./request.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";
import { requestSearchableFields } from "./request.constant";

/*
 ** Request Donor For Blood,
 ** Get My Donation Request,
 ** Update Request Status ,
 */

const requestDonorForBloodIntoDB = async (token: string, payload: any) => {
  const { phoneNumber, dateOfDonation, hospitalName, hospitalAddress, reason } =
    payload;

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

  // Check if the donor is available in database: check if the donorId is valid
  // const donorData = await prisma.user.findUniqueOrThrow({
  //   where: {
  //     id: payload.donorId,
  //   },
  // });

  // if (!donorData) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Donor not found! Please try with valid donor id.."
  //   );
  // }

  const RequestInfo = {
    donorId: payload?.donorId,
    requesterId: requesterData?.id,
    phoneNumber,
    dateOfDonation,
    hospitalName,
    hospitalAddress,
    reason,
  };

  // Create a request to a Donor (user) For Blood
  const requestData = await prisma.request.create({
    data: RequestInfo,
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          email: true,
          bloodType: true,
          location: true,
          availability: true,
          createdAt: true,
          updatedAt: true,
          userProfile: true,
        },
      },
    },
  });

  return requestData;
};

const getMyDonationRequestFromDB = async (token: string) => {
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

  const result = await prisma.request.findMany({
    where: {
      donorId: userData.id, // Filter by donorId equal to current user's id
      requesterId: {
        not: userData.id, // Filter where requesterId is not equal to current user's id
      },
      // isAccepted: false,
    },
  });

  // Fetch requester data separately
  const requesterIds = result.map((request) => request.requesterId);
  const requesterData = await prisma.user.findMany({
    where: {
      id: {
        in: requesterIds,
      },
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
    },
  });

  // Merge requester data with the result
  const resultWithRequester = result.map((request) => {
    const requester = requesterData.find(
      (user) => user.id === request.requesterId
    );
    return {
      ...request,
      requester,
    };
  });

  return resultWithRequester;
};

const getDonationRequestByMe = async (token: string) => {
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

  const result = await prisma.request.findMany({
    where: {
      requesterId: userData.id, // Filter by requesterId equal to current user's id
      donorId: {
        not: userData.id, // Filter where donorId is not equal to current user's id
      },
    },
  });

  // Fetch donor data separately
  const donorIds = result.map((request) => request.donorId);
  const donorData = await prisma.user.findMany({
    where: {
      id: {
        in: donorIds,
      },
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
    },
  });

  // Merge donor data with the result
  const resultWithDonor = result.map((request) => {
    const donor = donorData.find((user) => user.id === request.donorId);
    return {
      ...request,
      donor,
    };
  });

  return resultWithDonor;
};

// Update Request Application Status
const updateRequestStatusIntoDB = async (
  token: string,
  requestId: string,
  payload: any
) => {
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

  // update the request status data
  const updatedData = await prisma.request.update({
    where: {
      id: requestId,
    },
    data: payload,
  });

  return updatedData;
};

const getAllDonationRequestFromDB = async (
  params: IRequestFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const andConditions: Prisma.RequestWhereInput[] = [];

  const { searchTerm, ...filterData } = params;

  // console.log(searchTerm);
  if (searchTerm) {
    andConditions.push({
      OR: [
        { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
        { hospitalName: { contains: searchTerm, mode: "insensitive" } },
        { hospitalAddress: { contains: searchTerm, mode: "insensitive" } },
        { reason: { contains: searchTerm, mode: "insensitive" } },
        { donor: { name: { contains: searchTerm, mode: "insensitive" } } },
        { donor: { email: { contains: searchTerm, mode: "insensitive" } } },
        { donor: { bloodType: { contains: searchTerm, mode: "insensitive" } } },
        { donor: { location: { contains: searchTerm, mode: "insensitive" } } },
      ],
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

  const whereConditions: Prisma.RequestWhereInput = { AND: andConditions };

  // Step 1: Fetch all donation requests
  const requests = await prisma.request.findMany({
    where: whereConditions,
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          email: true,
          bloodType: true,
          location: true,
          availability: true,
          activeStatus: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
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

  // Step 2: Fetch requesters based on requesterId from the user table without the password field
  const requestsWithRequesters = await Promise.all(
    requests.map(async (request) => {
      const requester = await prisma.user.findUnique({
        where: { id: request.requesterId },
        select: {
          id: true,
          name: true,
          email: true,
          bloodType: true,
          location: true,
          availability: true,
          activeStatus: true,
          isDeleted: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return {
        ...request,
        requester,
      };
    })
  );

  // Fetch the total count of matching records for pagination
  const total = await prisma.request.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: requestsWithRequesters,
  };
};

const getSingleRequestByMyFromDB = async (id: string) => {
  const result = await prisma.request.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const deleteRequst = async (token: string, requestId: string) => {
  // Check if the token is valid or not
  const isTokenValid = jwtHelpers.verifyToken(
    token,
    config.JWT_ACCESS_SECRET as Secret
  );

  if (!isTokenValid) {
    throw new ApiError(httpStatus.FORBIDDEN, "FORBIDDEN");
  }

  // Check if the donor is available in the database
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

  const deleteRequest = await prisma.request.deleteMany({
    where: {
      id: requestId,
      requesterId: requesterData.id,
    },
  });

  if (deleteRequest.count === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No request found!");
  }

  return deleteRequest;
};

export const RequestServices = {
  requestDonorForBloodIntoDB,
  getMyDonationRequestFromDB,
  updateRequestStatusIntoDB,
  getDonationRequestByMe,
  getAllDonationRequestFromDB,
  getSingleRequestByMyFromDB,
  deleteRequst,
};
