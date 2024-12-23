"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const request_service_1 = require("./request.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const request_constant_1 = require("./request.constant");
/*
 ** Request Donor For Blood,
 ** Get My Received Donation Request,
 ** Get My Created Donation Request,
 ** Update Request Status (approved, pending),
 ** Get all donation request (As an Admin)
 */
const requestDonorForBlood = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const result = yield request_service_1.RequestServices.requestDonorForBloodIntoDB(token, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Request successfully made",
        data: result,
    });
}));
const getMyDonationRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const result = yield request_service_1.RequestServices.getMyDonationRequestFromDB(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation requests retrieved successfully",
        data: result,
    });
}));
const getDonationRequestByMe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const result = yield request_service_1.RequestServices.getDonationRequestByMe(token);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation requests made by me retrieved successfully",
        data: result,
    });
}));
const updateRequestStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const { requestId } = req.params;
    const result = yield request_service_1.RequestServices.updateRequestStatusIntoDB(token, requestId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation request status successfully updated",
        data: result,
    });
}));
const getAllDonationRequestFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, request_constant_1.requestFilterableFilds);
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = yield request_service_1.RequestServices.getAllDonationRequestFromDB(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation requests retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleRequestByMyFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestId } = req.params;
    const result = yield request_service_1.RequestServices.getSingleRequestByMyFromDB(requestId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User retrive successfully",
        data: result,
    });
}));
const deleteRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.authorization || "";
    const { requestId } = req.params;
    const result = yield request_service_1.RequestServices.deleteRequst(token, requestId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Delete you request successfully!",
        data: result,
    });
}));
exports.RequestControllers = {
    requestDonorForBlood,
    getMyDonationRequest,
    updateRequestStatus,
    getDonationRequestByMe,
    getAllDonationRequestFromDB,
    getSingleRequestByMyFromDB,
    deleteRequest,
};
