/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getEffectivePlan } from "./getEffectivePlan";

export const enforceReviewReplyPermission = async (userId: string) => {
  const plan: any = await getEffectivePlan(userId);

  if (!plan.features.canReplyToReviews) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Upgrade to Pro or Elite to reply to reviews"
    );
  }
};
