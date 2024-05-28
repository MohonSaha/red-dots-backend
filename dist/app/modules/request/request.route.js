"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRoutes = void 0;
const express_1 = __importDefault(require("express"));
const request_controller_1 = require("./request.controller");
const router = express_1.default.Router();
/*
 ** Request Donor For Blood,
 ** Get My Donation Request,
 ** Update Request Status ,
 */
router.post("/donation-request", request_controller_1.RequestControllers.requestDonorForBlood);
router.get("/donation-request", request_controller_1.RequestControllers.getMyDonationRequest);
router.get("/donation-request-by-me", request_controller_1.RequestControllers.getDonationRequestByMe);
router.put("/donation-request/:requestId", request_controller_1.RequestControllers.updateRequestStatus);
exports.RequestRoutes = router;
