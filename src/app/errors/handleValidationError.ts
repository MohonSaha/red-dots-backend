interface ZodError {
  message: string;
  path: string[];
}

interface ErrorDetails {
  issues: {
    field: string;
    message: string;
  }[];
}

interface ValidationErrorResponse {
  message: string;
  errorDetails: ErrorDetails;
}

const handleValidationError = (err: {
  errors: ZodError[];
}): ValidationErrorResponse => {
  const errorDetails = {
    issues: err.errors.map((err: any) => ({
      field: err.path[1],
      message: `${err.message}.`,
    })),
  };

  // Format the error message
  const fieldErrors = errorDetails.issues.map((issue: any) => issue.message);
  const message = fieldErrors.join(" ");

  return {
    message,
    errorDetails: errorDetails,
  };
};

export default handleValidationError;
