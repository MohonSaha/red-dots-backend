import express from "express";
import { RequestControllers } from "./request.controller";

const router = express.Router();

/*
 ** Request Donor For Blood,
 ** Get My Donation Request,
 ** Update Request Status ,
 ** Get single donation Request,
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
  RequestControllers.getAllDonationRequestFromDB
);

export const RequestRoutes = router;
