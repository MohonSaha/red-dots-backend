import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

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

  // // check if the user can not request himself
  // if (payload?.donorId === requesterData.id) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Wrong request. You can not request yourself.."
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

export const RequestServices = {
  requestDonorForBloodIntoDB,
  getMyDonationRequestFromDB,
  updateRequestStatusIntoDB,
  getDonationRequestByMe,
};
