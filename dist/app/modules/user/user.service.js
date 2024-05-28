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
exports.UserServices = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../../helpers/paginationHelper");
const user_constant_1 = require("./user.constant");
const JwtError_1 = __importDefault(require("../../errors/JwtError"));
/*
 ** create user
 ** get my profile
 ** update my profile
 ** get all donors
 */
const createUserIntoDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(data.password, 12);
    const userData = {
        name: data.name,
        email: data.email,
        role: client_1.UserRole.USER,
        password: hashedPassword,
        bloodType: data.bloodType,
        location: data.location,
        availability: data.availability,
    };
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        // Operation-1
        const createdUserData = yield transactionClient.user.create({
            data: userData,
        });
        // Operation-2
        const createdProfileData = yield transactionClient.userProfile.create({
            data: {
                bio: data.bio || "",
                age: data.age,
                lastDonationDate: data.lastDonationDate,
                userId: createdUserData.id,
            },
        });
        const { password } = createdUserData, userDataWithoutPassword = __rest(createdUserData, ["password"]);
        // Combine user data and user profile data
        const userDataWithProfile = Object.assign(Object.assign({}, userDataWithoutPassword), { userProfile: createdProfileData });
        return userDataWithProfile;
    }));
    return result;
});
const getMyProfileFromDB = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the token is valid or not
    const isTokenValid = jwtHelper_1.jwtHelpers.verifyToken(token, config_1.default.JWT_ACCESS_SECRET);
    if (!isTokenValid) {
        throw new JwtError_1.default(http_status_1.default.FORBIDDEN, "FORBIDDEN");
    }
    // Check if the user is available in database
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: isTokenValid.email,
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
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    bio: true,
                    age: true,
                    lastDonationDate: true,
                    height: true,
                    weight: true,
                    gender: true,
                    hasAllergies: true,
                    hasDiabetes: true,
                    phoneNumber: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });
    return userData;
});
const updateMyProfileIntoDB = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { bloodType, location, name, email, availability } = payload, userProfileData = __rest(payload, ["bloodType", "location", "name", "email", "availability"]);
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
    // update the user profile
    // const updatedData = await prisma.userProfile.update({
    //   where: {
    //     userId: userData.id,
    //   },
    //   data: payload,
    // });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const updateUserData = yield transactionClient.user.update({
            where: { id: userData.id },
            data: { bloodType, location, name, email, availability },
        });
        const updateProfileData = yield transactionClient.userProfile.upsert({
            where: { userId: userData.id }, // Use userId for the unique condition
            update: userProfileData, // Update if already exists
            create: {
                age: userProfileData.age,
                bio: userProfileData.bio,
                gender: userProfileData.gender,
                hasAllergies: userProfileData.hasAllergies,
                hasDiabetes: userProfileData.hasDiabetes,
                height: userProfileData.height,
                lastDonationDate: userProfileData.lastDonationDate,
                phoneNumber: userProfileData.phoneNumber,
                weight: userProfileData.weight,
                user: {
                    connect: { id: userData.id }, // Connect the existing user
                },
            },
        });
        return updateProfileData;
    }));
    return result;
});
// Get all donors
const getAllDonors = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const andConditions = [];
    const { searchTerm, availability } = params, filterData = __rest(params, ["searchTerm", "availability"]);
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.donorSearchableFields.map((field) => ({
                [field]: {
                    contains: params.searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    // Add filter for availability if it's specified in params
    if (availability !== undefined) {
        andConditions.push({
            availability: availability === "false" ? false : true,
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
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true,
            bloodType: true,
            location: true,
            availability: true,
            createdAt: true,
            updatedAt: true,
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    bio: true,
                    age: true,
                    lastDonationDate: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
        skip,
        take: limit,
        orderBy: options.sortBy === "age" || options.sortBy === "lastDonationDate"
            ? {
                userProfile: {
                    [sortBy]: options.sortOrder,
                },
            }
            : options.sortBy && options.sortBy
                ? { [sortBy]: options.sortOrder }
                : { createdAt: "desc" },
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            page,
            limit,
            total,
        },
        data: result,
    };
});
const getByIdFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.user.findUnique({
        where: {
            id,
            // isDeleted: false,
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
            userProfile: {
                select: {
                    id: true,
                    userId: true,
                    bio: true,
                    age: true,
                    lastDonationDate: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });
    return result;
});
const updateUserInfoIntoDB = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id,
        },
    });
    const updateUserStatus = yield prisma_1.default.user.update({
        where: {
            id,
        },
        data: updateData,
    });
    return updateUserStatus;
});
exports.UserServices = {
    createUserIntoDB,
    getMyProfileFromDB,
    updateMyProfileIntoDB,
    getAllDonors,
    getByIdFromDB,
    updateUserInfoIntoDB,
};
