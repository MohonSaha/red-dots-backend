import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserIntoDB(req.body);

  // Set refresh token to the cookie
  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false, // TODO: Change it true in production
    httpOnly: true,
  });

  const responseData = {
    id: result.userData.id,
    name: result.userData.name,
    email: result.userData.email,
    accessToken: result.accessToken,
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: responseData,
  });
});

export const AuthControllers = {
  loginUser,
};
