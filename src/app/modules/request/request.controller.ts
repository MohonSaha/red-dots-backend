import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { RequestServices } from "./request.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

/*
 ** Request Donor For Blood,
 ** Get My Donation Request,
 ** Update Request Status ,
 */

const requestDonorForBlood = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";

  const result = await RequestServices.requestDonorForBloodIntoDB(
    token,
    req.body
  );

  console.log("controler", req.body);

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

export const RequestControllers = {
  requestDonorForBlood,
  getMyDonationRequest,
  updateRequestStatus,
  getDonationRequestByMe,
};
