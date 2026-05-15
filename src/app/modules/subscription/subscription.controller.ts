/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const getMyCurrentSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await SubscriptionService.getMyCurrentSubscription(user.userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Current subscription retrieved successfully",
      data: result,
    });
  }
);

const getMySubscriptionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await SubscriptionService.getMySubscriptionHistory(user.userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Subscription history retrieved successfully",
      data: result,
    });
  }
);

const subscribeToPlan = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { planId } = req.body;

  const result = await SubscriptionService.subscribeToPlan(user.userId, planId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Subscription activated successfully",
    data: result,
  });
});

const cancelMySubscription = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;

    const result = await SubscriptionService.cancelMySubscription(user.userId);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Subscription cancelled successfully",
      data: result,
    });
  }
);

export const SubscriptionController = {
  getMyCurrentSubscription,
  getMySubscriptionHistory,
  subscribeToPlan,
  cancelMySubscription,
};