import { Secret } from "jsonwebtoken";
import { jwtHelpers } from "../../../helpers/jwtHelper";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";
import config from "../../../config";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { UserStatus } from "@prisma/client";

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  if (!payload.email) {
    console.log("requires email error");
    throw new Error("Email is required");
  }

  // check: if the user available
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! Please try again.."
    );
  }

  // check: if the password correct
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect! Please try again..");
  }

  // Create access token

  const tokenData = { email: userData.email, role: userData.role };

  const accessToken = jwtHelpers.generateToken(
    tokenData,
    config.JWT_ACCESS_SECRET as Secret,
    config.JWT_ACCESS_TOKEN_EXPIRES_IN as string
  );

  // Create refresh token
  const refreshToken = jwtHelpers.generateToken(
    tokenData,
    config.JWT_REFRESH_SECRET as Secret,
    config.JWT_REFRESH_TOKEN_EXPIRES_IN as string
  );

  return {
    userData,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  // Decoded the refresh token and verity
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      refreshToken,
      config.JWT_REFRESH_SECRET as Secret
    );
  } catch (error) {
    throw new Error("You are not authorized!");
  }

  // Check if the user is available in database or not
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      activeStatus: UserStatus.ACTIVATE,
    },
  });

  // if refresh token is verify and user is exist in database then create access token again
  const tokenData = { email: userData.email, role: userData.role };
  const accessToken = jwtHelpers.generateToken(
    tokenData,
    config.JWT_ACCESS_SECRET as Secret,
    config.JWT_ACCESS_TOKEN_EXPIRES_IN as string
  );

  return {
    accessToken,
  };
};

const changePassword = async (user: any, payload: any) => {
  // Check if the user is available in database
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      activeStatus: UserStatus.ACTIVATE,
    },
  });

  // check: if the old(current) password is correct
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new Error("Password incorrect!");
  }

  // hash the password
  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  // update the new password
  await prisma.user.update({
    where: {
      email: userData.email,
      activeStatus: UserStatus.ACTIVATE,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

export const AuthServices = {
  loginUserIntoDB,
  refreshToken,
  changePassword,
};
