/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ServiceServices } from "./service.service";
import { IService } from "./service.interface";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";

/**
 * POST /service/create
 *
 * Body (multipart/form-data):
 *   - All IService fields
 *   - planId: string   ← the selected plan's _id
 *
 * Response variants:
 *   Free plan  → { data: { free: true } }
 *   Paid plan  → { data: { checkout_url: "https://..." } }
 *
 * The frontend should check `data.free`:
 *   - true            → redirect to dashboard / success page immediately
 *   - false/undefined → redirect to data.checkout_url (Stripe checkout)
 */
const createService = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
 
  const files = req.files as {
    media?: Express.Multer.File[];
    company_logo?: Express.Multer.File[];
  };
 
  const payload: Partial<IService> & { planId: string } = {
    ...req.body,
    media: files?.media?.map((file) => file.path) || [],
    company_logo: files?.company_logo?.[0]?.path || "",
  };
 
  const result = await ServiceServices.createService(payload, user.userId);
 
  if ("free" in result) {
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Service created and free plan activated successfully",
      data: result, // { free: true }
    });
  }
 
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Service created. Redirecting to payment...",
    data: result, // { checkout_url: "https://checkout.stripe.com/..." }
  });
});

const getAllServices = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ServiceServices.getAllServices(
      query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Services Retrieved Successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const service = await ServiceServices.getSingleService(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Get single service successfully",
      data: service,
    });
  }
);

// Controller to get nearest services based on user location
const getNearestServices = catchAsync(async (req: Request, res: Response) => {
  const { lon, lat, minRating, radius, categories } = req.body;

  const services = await ServiceServices.getNearestServices(
    lon,
    lat,
    minRating ? parseFloat(minRating) : undefined,
    radius ? parseFloat(radius) : undefined,
    categories
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Nearest services retrieved successfully",
    data: services,
  });
});

const searchServices = catchAsync(async (req: Request, res: Response) => {
  const { lon, lat, searchTerm, viewAll } = req.query;

  if (!searchTerm) {
    throw new AppError(httpStatus.BAD_REQUEST, "searchTerm is required");
  }

  const limit = viewAll === "true" ? undefined : 3;

  const result = await ServiceServices.searchServices(
    lon as string,
    lat as string,
    searchTerm as string,
    limit
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Search results retrieved successfully",
    data: result.data,
    meta: { total: result.total, showing: result.showing },
  });
});

/**
 * POST /services/by-category
 *
 * Powers the RIGHT PANEL of page 2.
 *
 * Body:
 * {
 *   categoryId:      string         ← required. The root/sub/child category ID clicked.
 *   lon:             string         ← required. User longitude.
 *   lat:             string         ← required. User latitude.
 *
 *   // ── optional filters ──────────────────────────────────────────────────
 *   offerServiceIds: string[]       ← specific sub/child category IDs selected via checkboxes.
 *                                     If omitted → all descendants are included.
 *   searchTerm:      string         ← free-text search on service_name.
 *   minRating:       number         ← e.g. 4.0
 *   radius:          number         ← in miles (default 10)
 *   availability:    boolean        ← true = show only currently open services
 * }
 *
 * Response data shape (each item):
 * {
 *   _id, service_name, company_logo, coordinates,
 *   distanceInMiles, averageRating, totalReviews, isAvailableNow,
 *   provider: { planName, badgeType, priorityScore }
 * }
 */
const getServicesByCategory = catchAsync(
  async (req: Request, res: Response) => {
    const {
      categoryId,
      lon,
      lat,
      offerServiceIds,
      searchTerm,
      minRating,
      radius,
      availability,
    } = req.body;

    if (!categoryId) {
      throw new AppError(httpStatus.BAD_REQUEST, "categoryId is required");
    }

    const result = await ServiceServices.getServicesByCategory({
      categoryId,
      lon,
      lat,
      offerServiceIds,
      searchTerm,
      minRating: minRating ? parseFloat(minRating) : undefined,
      radius: radius ? parseFloat(radius) : undefined,
      availability:
        availability !== undefined ? availability === true || availability === "true" : undefined,
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Services retrieved successfully",
      data: result.data,
      meta: { total: result.total },
    });
  }
);

const updateService = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const serviceId = req.params.id as string;

  const files = req.files as {
    media?: Express.Multer.File[];
    company_logo?: Express.Multer.File[];
  };

  const payload: Partial<IService> = {
    ...req.body,
  };

  if (files?.media) {
    payload.media = files.media.map((file) => file.path);
  }

  if (files?.company_logo?.[0]) {
    payload.company_logo = files.company_logo[0].path;
  }

  const service = await ServiceServices.updateService(serviceId, payload, user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Service updated successfully",
    data: service,
  });
});

const deleteService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    const id = req.params.id as string;
    await ServiceServices.deleteService(id, user);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Service deleted successfully",
      data: null,
    });
  }
);

export const ServiceControllers = {
  createService,
  getAllServices,
  getNearestServices,
  searchServices,
  getServicesByCategory,
  updateService,
  getSingleService,
  deleteService,
};