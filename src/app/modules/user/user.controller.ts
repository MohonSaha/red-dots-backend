import { Request, Response } from "express";
import { UserServices } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { donorFilterableFilds } from "./user.constant";
import pick from "../../../shared/pick";

/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await UserServices.getMyProfileFromDB(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await UserServices.updateMyProfileIntoDB(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile updated successfully",
    data: result,
  });
});

const getAllDonors = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, donorFilterableFilds);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await UserServices.getAllDonors(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donors successfully found",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrive successfully",
    data: result,
  });
});

const updateUserInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserInfoIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile updated successfully!",
    data: result,
  });
});

export const UserControllers = {
  createUser,
  getMyProfile,
  updateMyProfile,
  getAllDonors,
  getByIdFromDB,
  updateUserInfo,
};
