"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleValidationError = (err) => {
    const errorDetails = {
        issues: err.errors.map((err) => ({
            field: err.path[1],
            message: `${err.message}.`,
        })),
    };
    // Format the error message
    const fieldErrors = errorDetails.issues.map((issue) => issue.message);
    const message = fieldErrors.join(" ");
    return {
        message,
        errorDetails: errorDetails,
    };
};
exports.default = handleValidationError;
