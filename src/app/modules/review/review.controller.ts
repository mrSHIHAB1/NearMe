/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { ReviewServices } from "./review.service";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

const createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as JwtPayload;

  const result = await ReviewServices.createReview(req.body, user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Review Created Successfully",
    data: result
  });
});

const getServiceReviews = catchAsync(async (req: Request, res: Response) => {

  const { serviceId } = req.params;

  const result = await ReviewServices.getServiceReviews(serviceId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Reviews Retrieved Successfully",
    data: result
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {

  const { id } = req.params;

  const result = await ReviewServices.deleteReview(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Review Deleted Successfully",
    data: result
  });
});

export const ReviewControllers = {
  createReview,
  getServiceReviews,
  deleteReview
};