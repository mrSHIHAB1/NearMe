import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SuperAdminService } from "./superAdmin.service";
import { ProviderFilterStatus, UserFilterStatus } from "./superAdmin.interface";
import AppError from "../../errorHelpers/AppError";

/* ================================================================== */
/*  DASHBOARD                                                           */
/* ================================================================== */

/**
 * GET /super-admin/dashboard
 * Returns platform stats, provider status breakdown, and growth chart.
 */
const getDashboard = catchAsync(async (_req: Request, res: Response) => {
  const data = await SuperAdminService.getDashboardStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard stats retrieved successfully",
    data,
  });
});

/* ================================================================== */
/*  SERVICE PROVIDERS                                                   */
/* ================================================================== */

/**
 * GET /super-admin/service-providers
 * Query params:
 *   status  : "all" | "pending" | "paid" | "on_free_trial" | "suspended"
 *   page    : number (default 1)
 *   limit   : number (default 10)
 *   search  : string (optional)
 */
const getServiceProviders = catchAsync(async (req: Request, res: Response) => {
  const status = (req.query.status as ProviderFilterStatus) || "all";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const validStatuses: ProviderFilterStatus[] = [
    "all", "pending", "paid", "on_free_trial", "suspended",
  ];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const result = await SuperAdminService.getServiceProviders(
    status, page, limit, search
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service providers retrieved successfully",
    data: result.data,
    meta: result.meta,
    // counts for the tab badges
    ...(result.counts && { counts: result.counts }),
  });
});

/**
 * PATCH /super-admin/service-providers/:serviceId/suspend
 * Suspends the provider account (blocks user + deactivates service).
 */
const suspendServiceProvider = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params as { serviceId: string };

    await SuperAdminService.suspendServiceProvider(serviceId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service provider suspended successfully",
      data: null,
    });
  }
);

/**
 * DELETE /super-admin/service-providers/:serviceId/withdraw
 * Permanently removes the service and soft-deletes the provider account.
 */
/**
 * PATCH /super-admin/service-providers/:serviceId/unsuspend
 * Unsuspends/reactivates the provider account (unblocks user + reactivates service).
 */
const unsuspendServiceProvider = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params as { serviceId: string };

    await SuperAdminService.unsuspendServiceProvider(serviceId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service provider unsuspended successfully",
      data: null,
    });
  }
);

/**
 * DELETE /super-admin/service-providers/:serviceId/withdraw
 * Permanently removes the service and soft-deletes the provider account.
 */
const withdrawServiceProvider = catchAsync(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params as { serviceId: string };

    await SuperAdminService.withdrawServiceProvider(serviceId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service provider withdrawn successfully",
      data: null,
    });
  }
);

/* ================================================================== */
/*  USERS                                                               */
/* ================================================================== */

/**
 * GET /super-admin/users
 * Query params:
 *   status : "all" | "active" | "blocked"
 *   page   : number (default 1)
 *   limit  : number (default 10)
 *   search : string (optional)
 */
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const status = (req.query.status as UserFilterStatus) || "all";
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || "";

  const validStatuses: UserFilterStatus[] = ["all", "active", "blocked"];
  if (!validStatuses.includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const result = await SuperAdminService.getUsers(status, page, limit, search);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
    ...(result.counts && { counts: result.counts }),
  });
});

/**
 * PATCH /super-admin/users/:userId/block
 * Blocks a user account.
 */
const blockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  await SuperAdminService.blockUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User blocked successfully",
    data: null,
  });
});

/**
 * PATCH /super-admin/users/:userId/unblock
 * Restores a blocked user account.
 */
const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  await SuperAdminService.unblockUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User unblocked successfully",
    data: null,
  });
});

/**
 * DELETE /super-admin/users/:userId
 * Permanently deletes a user account.
 */
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params as { userId: string };

  await SuperAdminService.deleteUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User deleted successfully",
    data: null,
  });
});

/* ================================================================== */
/*  REVENUE                                                             */
/* ================================================================== */

/**
 * GET /super-admin/revenue
 * Query params:
 *   page  : number (default 1)  — for payment log pagination
 *   limit : number (default 10)
 */
const getRevenue = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const data = await SuperAdminService.getRevenueData(page, limit);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Revenue data retrieved successfully",
    data,
  });
});

/* ================================================================== */
/*  EXPORTS                                                             */
/* ================================================================== */
export const SuperAdminController = {
  getDashboard,
  getServiceProviders,
  suspendServiceProvider,
  unsuspendServiceProvider,
  withdrawServiceProvider,
  getUsers,
  blockUser,
  unblockUser,
  deleteUser,
  getRevenue,
};