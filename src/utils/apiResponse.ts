import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T
) => {
  return res.status(200).json({
    success: true,
    message,
    ...(data !== undefined && { data }), // Only include `data` if provided
  });
};

export const errorResponse = (res: Response, error: any, statusCode = 500) => {
  const errorMessage =
    error instanceof Error ? error.message : error || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    error: errorMessage,
  });
};
