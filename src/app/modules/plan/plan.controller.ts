import { Request, Response } from "express";
import { PlanService } from "./plan.service";

import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getAllPlans = catchAsync(async (_req: Request, res: Response) => {
  const result = await PlanService.getAllPlans();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Plans retrieved successfully",
    data: result,
  });
});

const getSinglePlan = catchAsync(async (req: Request, res: Response) => {
  const result = await PlanService.getSinglePlan(req.params.id as string);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Plan retrieved successfully",
    data: result,
  });
});

export const PlanController = {
  getAllPlans,
  getSinglePlan,
};