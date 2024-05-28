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
exports.RequestServices = void 0;
const config_1 = __importDefault(require("../../../config"));
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
/*
 ** Request Donor For Blood,
 ** Get My Donation Request,
 ** Update Request Status ,
 */
const requestDonorForBloodIntoDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { phoneNumber, dateOfDonation, hospitalName, hospitalAddress, reason } = payload;
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the requester is available in database: check if the requesterId is valid
    const requesterData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: isTokenValid.email,
        },
    });
    if (!requesterData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    // Check if the donor is available in database: check if the donorId is valid
    // const donorData = await prisma.user.findUniqueOrThrow({
    //   where: {
    //     id: payload.donorId,
    //   },
    // });
    // if (!donorData) {
    //   throw new ApiError(
    //     httpStatus.NOT_FOUND,
    //     "Donor not found! Please try with valid donor id.."
    //   );
    // }
    const RequestInfo = {
        donorId: payload === null || payload === void 0 ? void 0 : payload.donorId,
        requesterId: requesterData === null || requesterData === void 0 ? void 0 : requesterData.id,
        phoneNumber,
        dateOfDonation,
        hospitalName,
        hospitalAddress,
        reason,
    };
    // Create a request to a Donor (user) For Blood
    const requestData = yield prisma_1.default.request.create({
        data: RequestInfo,
        include: {
            donor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    bloodType: true,
                    location: true,
                    availability: true,
                    createdAt: true,
                    updatedAt: true,
                    userProfile: true,
                },
            },
        },
    });
    return requestData;
});
const getMyDonationRequestFromDB = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the user is available in database
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: isTokenValid.email,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    const result = yield prisma_1.default.request.findMany({
        where: {
            donorId: userData.id, // Filter by donorId equal to current user's id
            requesterId: {
                not: userData.id, // Filter where requesterId is not equal to current user's id
            },
        },
    });
    // Fetch requester data separately
    const requesterIds = result.map((request) => request.requesterId);
    const requesterData = yield prisma_1.default.user.findMany({
        where: {
            id: {
                in: requesterIds,
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            bloodType: true,
            location: true,
            availability: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    // Merge requester data with the result
    const resultWithRequester = result.map((request) => {
        const requester = requesterData.find((user) => user.id === request.requesterId);
        return Object.assign(Object.assign({}, request), { requester });
    });
    return resultWithRequester;
});
const getDonationRequestByMe = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the user is available in database
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: isTokenValid.email,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    const result = yield prisma_1.default.request.findMany({
        where: {
            requesterId: userData.id, // Filter by requesterId equal to current user's id
            donorId: {
                not: userData.id, // Filter where donorId is not equal to current user's id
            },
        },
    });
    // Fetch donor data separately
    const donorIds = result.map((request) => request.donorId);
    const donorData = yield prisma_1.default.user.findMany({
        where: {
            id: {
                in: donorIds,
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            bloodType: true,
            location: true,
            availability: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    // Merge donor data with the result
    const resultWithDonor = result.map((request) => {
        const donor = donorData.find((user) => user.id === request.donorId);
        return Object.assign(Object.assign({}, request), { donor });
    });
    return resultWithDonor;
});
// Update Request Application Status
const updateRequestStatusIntoDB = (token, requestId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the user is available in database
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: isTokenValid.email,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    // update the request status data
    const updatedData = yield prisma_1.default.request.update({
        where: {
            id: requestId,
        },
        data: payload,
    });
    return updatedData;
});
exports.RequestServices = {
    requestDonorForBloodIntoDB,
    getMyDonationRequestFromDB,
    updateRequestStatusIntoDB,
    getDonationRequestByMe,
};
