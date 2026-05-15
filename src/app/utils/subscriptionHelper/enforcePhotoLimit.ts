/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { getEffectivePlan } from "./getEffectivePlan";


export const enforcePhotoLimit = async (
  userId: string,
  currentPhotoCount: number,
  newPhotosCount = 1
) => {
  const plan: any = await getEffectivePlan(userId);
  const limit = plan.features.maxPhotos;

  if (limit !== -1 && currentPhotoCount + newPhotosCount > limit) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `Your current plan allows maximum ${limit} photos`
    );
  }
};
