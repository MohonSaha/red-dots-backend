import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import handleValidationError from "../errors/handleValidationError";
import jwtError from "../errors/JwtError";
import ApiError from "../errors/ApiError";

const globalErrorHanlder = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // setting default values
  let message = "Something went Wrong!!!";
  let errorDetails;

  if (err.name === "ZodError") {
    const simplifiedError = handleValidationError(err);
    message = simplifiedError.message;
    errorDetails = simplifiedError.errorDetails;
  } else if (err instanceof jwtError) {
    message = err.message;
    errorDetails = err;
  } else if (err.name === "JsonWebTokenError") {
    message = err.message;
    errorDetails = err;
  } else if (err instanceof ApiError) {
    message = err.message;
    errorDetails = err;
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = err;
  }

  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    seccess: false,
    message,
    errorDetails: errorDetails,
  });
};

export default globalErrorHanlder;
