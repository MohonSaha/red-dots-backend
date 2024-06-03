import express from "express";
import { RequestControllers } from "./request.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

/*
 ** Request Donor For Blood,
 ** Get My Received Donation Request,
 ** Get My Created Donation Request,
 ** Update Request Status (approved, pending),
 ** Get all donation request (As an Admin)
 ** Get single request by id
 */

router.post("/donation-request", RequestControllers.requestDonorForBlood);

router.get("/donation-request", RequestControllers.getMyDonationRequest);

router.get(
  "/donation-request-by-me",
  RequestControllers.getDonationRequestByMe
);

router.patch(
  "/donation-request/:requestId",
  RequestControllers.updateRequestStatus
);

router.get(
  "/all-donation-requests",
  auth(UserRole.ADMIN),
  RequestControllers.getAllDonationRequestFromDB
);

router.get(
  "/donation-request/:requestId",
  RequestControllers.getSingleRequestByMyFromDB
);

router.delete("/donation-request/:requestId", RequestControllers.deleteRequest);

export const RequestRoutes = router;
