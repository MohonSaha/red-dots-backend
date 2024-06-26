import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { RequestServices } from "./request.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { requestFilterableFilds } from "./request.constant";

/*
 ** Request Donor For Blood,
 ** Get My Received Donation Request,
 ** Get My Created Donation Request,
 ** Update Request Status (approved, pending),
 ** Get all donation request (As an Admin)
 */

const requestDonorForBlood = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await RequestServices.requestDonorForBloodIntoDB(
    token,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Request successfully made",
    data: result,
  });
});

const getMyDonationRequest = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await RequestServices.getMyDonationRequestFromDB(token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation requests retrieved successfully",
    data: result,
  });
});

const getDonationRequestByMe = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization || "";

    const result = await RequestServices.getDonationRequestByMe(token);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donation requests made by me retrieved successfully",
      data: result,
    });
  }
);

const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const { requestId } = req.params;

  const result = await RequestServices.updateRequestStatusIntoDB(
    token,
    requestId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Donation request status successfully updated",
    data: result,
  });
});

const getAllDonationRequestFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, requestFilterableFilds);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

    const result = await RequestServices.getAllDonationRequestFromDB(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Donation requests retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getSingleRequestByMyFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const result = await RequestServices.getSingleRequestByMyFromDB(requestId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User retrive successfully",
      data: result,
    });
  }
);

const deleteRequest = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  const { requestId } = req.params;

  const result = await RequestServices.deleteRequst(token, requestId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Delete you request successfully!",
    data: result,
  });
});

export const RequestControllers = {
  requestDonorForBlood,
  getMyDonationRequest,
  updateRequestStatus,
  getDonationRequestByMe,
  getAllDonationRequestFromDB,
  getSingleRequestByMyFromDB,
  deleteRequest,
};
