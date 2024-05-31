import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import { PostServices } from "./bloodPost.service";
import pick from "../../../shared/pick";
import { postFilterableFilds } from "./bloodPost.constant";

const createPostForBlood = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await PostServices.createPostForBlood(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post for blood created successfully!",
    data: result,
  });
});

const getAllBloodPost = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, postFilterableFilds);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await PostServices.getAllBloodPostFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post for blood retrieved successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleBloodPost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const result = await PostServices.getSingleBloodPostFromDB(postId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single blood post retrieved successfully!",
    data: result,
  });
});

const acceptPostByDonor = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await PostServices.acceptPostByDonorIntoDB(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post for blood created successfully!",
    data: result,
  });
});

const deleteAcceptedPost = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const postId = req.params.postId;

  const result = await PostServices.deleteAcceptedPostFormDB(token, postId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Acceptance record successfully!",
    data: result,
  });
});

const getMyAcceptedPost = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await PostServices.getMyAccpetedPostFromDB(token);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "My accepted post retrived successfully!",
    data: result,
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await PostServices.getMyPostsFromDB(token);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "My accepted post retrived successfully!",
    data: result,
  });
});

export const PostControllers = {
  createPostForBlood,
  getAllBloodPost,
  acceptPostByDonor,
  deleteAcceptedPost,
  getSingleBloodPost,
  getMyAcceptedPost,
  getMyPosts,
};
