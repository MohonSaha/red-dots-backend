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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
const paginationHelper_1 = require("../../../helpers/paginationHelper");
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
            // isAccepted: false,
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
const getAllDonationRequestFromDB = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    // console.log(searchTerm);
    if (searchTerm) {
        andConditions.push({
            OR: [
                { phoneNumber: { contains: searchTerm, mode: "insensitive" } },
                { hospitalName: { contains: searchTerm, mode: "insensitive" } },
                { hospitalAddress: { contains: searchTerm, mode: "insensitive" } },
                { reason: { contains: searchTerm, mode: "insensitive" } },
                { donor: { name: { contains: searchTerm, mode: "insensitive" } } },
                { donor: { email: { contains: searchTerm, mode: "insensitive" } } },
                { donor: { bloodType: { contains: searchTerm, mode: "insensitive" } } },
                { donor: { location: { contains: searchTerm, mode: "insensitive" } } },
            ],
        });
    }
    //   Implementing Filtering On Specific Fields And Values
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = { AND: andConditions };
    // Step 1: Fetch all donation requests
    const requests = yield prisma_1.default.request.findMany({
        where: whereConditions,
        include: {
            donor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    bloodType: true,
                    location: true,
                    availability: true,
                    activeStatus: true,
                    isDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? {
                [sortBy]: sortOrder,
            }
            : { createdAt: "desc" },
    });
    // Step 2: Fetch requesters based on requesterId from the user table without the password field
    const requestsWithRequesters = yield Promise.all(requests.map((request) => __awaiter(void 0, void 0, void 0, function* () {
        const requester = yield prisma_1.default.user.findUnique({
            where: { id: request.requesterId },
            select: {
                id: true,
                name: true,
                email: true,
                bloodType: true,
                location: true,
                availability: true,
                activeStatus: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return Object.assign(Object.assign({}, request), { requester });
    })));
    // Fetch the total count of matching records for pagination
    const total = yield prisma_1.default.request.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: requestsWithRequesters,
    };
});
const getSingleRequestByMyFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.request.findUnique({
        where: {
            id,
        },
    });
    return result;
});
const deleteRequst = (token, requestId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the donor is available in the database
    const requesterData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: isTokenValid.email,
        },
    });
    if (!requesterData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    const deleteRequest = yield prisma_1.default.request.deleteMany({
        where: {
            id: requestId,
            requesterId: requesterData.id,
        },
    });
    if (deleteRequest.count === 0) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "No request found!");
    }
    return deleteRequest;
});
exports.RequestServices = {
    requestDonorForBloodIntoDB,
    getMyDonationRequestFromDB,
    updateRequestStatusIntoDB,
    getDonationRequestByMe,
    getAllDonationRequestFromDB,
    getSingleRequestByMyFromDB,
    deleteRequst,
};
