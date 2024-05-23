"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const JwtError_1 = __importDefault(require("../errors/JwtError"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const globalErrorHanlder = (err, req, res, next) => {
    // setting default values
    let message = "Something went Wrong!!!";
    let errorDetails;
    if (err.name === "ZodError") {
        const simplifiedError = (0, handleValidationError_1.default)(err);
        message = simplifiedError.message;
        errorDetails = simplifiedError.errorDetails;
    }
    else if (err instanceof JwtError_1.default) {
        message = err.message;
        errorDetails = err;
    }
    else if (err.name === "JsonWebTokenError") {
        message = err.message;
        errorDetails = err;
    }
    else if (err instanceof ApiError_1.default) {
        message = err.message;
        errorDetails = err;
    }
    else if (err instanceof Error) {
        message = err.message;
        errorDetails = err;
    }
    res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
        seccess: false,
        message,
        errorDetails: errorDetails,
    });
};
exports.default = globalErrorHanlder;
