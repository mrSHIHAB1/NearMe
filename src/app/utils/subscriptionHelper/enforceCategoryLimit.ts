/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getEffectivePlan } from "./getEffectivePlan";


export const enforceOfferServicesLimit = async (
  userId: string,
  offerServicesCount: number
) => {
  const plan: any = await getEffectivePlan(userId);
  const limit = plan.features.maxOfferServices;

  if (limit !== -1 && offerServicesCount > limit) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your current plan allows maximum ${limit} offered services`
    );
  }
};
