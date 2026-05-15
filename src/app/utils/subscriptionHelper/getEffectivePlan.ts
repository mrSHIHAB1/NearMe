/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from "http-status-codes";
import { Plan } from "../../modules/plan/plan.model";
import AppError from "../../errorHelpers/AppError";
import { getActiveSubscription } from "./getActiveSubscription";


export const getEffectivePlan = async (userId: string) => {
  const activeSubscription = await getActiveSubscription(userId);

  if (activeSubscription?.plan) {
    return activeSubscription.plan as any;
  }

  const freePlan = await Plan.findOne({ name: "free", isActive: true });

  if (!freePlan) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Free plan not found. Please seed plans first."
    );
  }

  return freePlan;
};

