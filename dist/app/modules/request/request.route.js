"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRoutes = void 0;
const express_1 = __importDefault(require("express"));
const request_controller_1 = require("./request.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
/*
 ** Request Donor For Blood,
 ** Get My Received Donation Request,
 ** Get My Created Donation Request,
 ** Update Request Status (approved, pending),
 ** Get all donation request (As an Admin)
 ** Get single request by id
 */
router.post("/donation-request", request_controller_1.RequestControllers.requestDonorForBlood);
router.get("/donation-request", request_controller_1.RequestControllers.getMyDonationRequest);
router.get("/donation-request-by-me", request_controller_1.RequestControllers.getDonationRequestByMe);
router.patch("/donation-request/:requestId", request_controller_1.RequestControllers.updateRequestStatus);
router.get("/all-donation-requests", (0, auth_1.default)(client_1.UserRole.ADMIN), request_controller_1.RequestControllers.getAllDonationRequestFromDB);
router.get("/donation-request/:requestId", request_controller_1.RequestControllers.getSingleRequestByMyFromDB);
router.delete("/donation-request/:requestId", request_controller_1.RequestControllers.deleteRequest);
exports.RequestRoutes = router;
