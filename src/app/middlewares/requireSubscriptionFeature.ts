/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { getEffectivePlan } from "../utils/subscriptionHelper/getEffectivePlan";


export const requireSubscriptionFeature = (featureKey: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user?._id) {
      return next(
        new AppError(httpStatus.UNAUTHORIZED, "User not authenticated")
      );
    }

    const plan: any = await getEffectivePlan(user._id);

    const value = plan?.features?.[featureKey];

    if (!value) {
      return next(
        new AppError(
          httpStatus.FORBIDDEN,
          "This feature is not available in your current plan"
        )
      );
    }

    next();
  };
};