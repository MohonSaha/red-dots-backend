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
exports.AuthServices = void 0;
const jwtHelper_1 = require("../../../helpers/jwtHelper");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check: if the user available
    const userData = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!userData) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found! Please try again..");
    }
    // check: if the password correct
    const isCorrectPassword = yield bcrypt_1.default.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new Error("Password incorrect! Please try again..");
    }
    // Create access token
    const tokenData = { email: userData.email };
    const accessToken = jwtHelper_1.jwtHelpers.generateToken(tokenData, config_1.default.JWT_ACCESS_SECRET, config_1.default.JWT_ACCESS_TOKEN_EXPIRES_IN);
    // Create refresh token
    const refreshToken = jwtHelper_1.jwtHelpers.generateToken(tokenData, config_1.default.JWT_REFRESH_SECRET, config_1.default.JWT_REFRESH_TOKEN_EXPIRES_IN);
    return {
        userData,
        accessToken,
        refreshToken,
    };
});
exports.AuthServices = {
    loginUserIntoDB,
};
