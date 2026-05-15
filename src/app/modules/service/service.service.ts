/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { Service } from "./service.model";
import { GetServicesByCategoryParams, IService } from "./service.interface";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { serviceSearchableFields } from "./service.constant";
import { enforceOfferServicesLimit } from "../../utils/subscriptionHelper/enforceCategoryLimit";
import { enforcePhotoLimit } from "../../utils/subscriptionHelper/enforcePhotoLimit";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { Review } from "../review/review.model";
import { buildServiceMeta } from "../../utils/getNearestServicesHelper/buildServiceMeta";
import { buildGeoQuery } from "../../utils/getNearestServicesHelper/getNearestServicesQuery";
import { getAllDescendantCategoryIds } from "../category/category.service";
import { ServiceAnalytics } from "../serviceAnalytics/serviceAnalytics.model";
import { Plan } from "../plan/plan.model";
import { JwtPayload } from "jsonwebtoken";
import { paymentService } from "../payment/payment.service";

// ─── Shared: aggregate ratings for a list of serviceIds ───────────────────────
const aggregateRatings = async (serviceIds: any[]) => {
  const ratingAggregates = await Review.aggregate([
    {
      $match: {
        service: { $in: serviceIds },
        parentReview: null,
        rating: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$service",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return new Map(ratingAggregates.map((r) => [r._id.toString(), r]));
};

// ─── Shared: slim select + provider populate ──────────────────────────────────
const SERVICE_SELECT =
  "_id service_name company_logo location openingTime closingTime allTimeAvailability service_address";
const PROVIDER_SELECT =
  "subscriptionInfo.planName subscriptionInfo.badgeType subscriptionInfo.priorityScore";

/* ------------------------------------------------------------------ */
/*  CREATE SERVICE + INITIATE PLAN PAYMENT                            */
/* ------------------------------------------------------------------ */
 
/**
 * Creates the service document, links it to the user, then initiates
 * plan payment.
 *
 * - Free plan  → payment is immediately marked PAID, returns { free: true }
 * - Paid plan  → returns { checkout_url } for the frontend to redirect
 *
 * The frontend should:
 *   if (data.free)       → redirect to /dashboard (or success page)
 *   if (data.checkout_url) → window.location.href = data.checkout_url
 */
const createService = async (
  payload: Partial<IService> & { planId: string },
  userId: string
): Promise<{ free: true } | { checkout_url: string | null }> => {
  /* ── 1. Guard: one service per provider ── */
  const existingService = await Service.findOne({ provider: userId });
  if (existingService) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "A provider can only create one service"
    );
  }
 
  /* ── 2. Validate the chosen plan ── */
  const plan = await Plan.findById(payload.planId);
  if (!plan || !plan.isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or inactive plan selected");
  }
 
  /* ── 3. Enforce feature limits based on the chosen plan ── */
  const offerServicesCount = payload.offer_services?.length || 0;
  await enforceOfferServicesLimit(userId, offerServicesCount);
 
  const incomingPhotosCount = payload.media?.length || 0;
  await enforcePhotoLimit(userId, 0, incomingPhotosCount);
 
  /* ── 4. Create the service (subscription fields default to inactive) ── */
  const { planId, ...serviceData } = payload;
 
  const service = await Service.create({
    ...serviceData,
    provider: userId,
    subscriptionStatus: "inactive", // will be updated after payment
  });
 
  /* ── 5. Link service to user ── */
  await User.findByIdAndUpdate(userId, {
    service: service._id,
    hasService: true,
  });
 
  /* ── 6. Initiate payment (free = auto-activate, paid = Stripe) ── */
  // We build a fake JwtPayload-like object because paymentService.stripePay
  // expects one. Adjust if your JwtPayload shape differs.
  const userJwt: JwtPayload = { userId, role: "PROVIDER" } as JwtPayload;
 
  const paymentResult = await paymentService.stripePay(
    userJwt,
    service._id.toString(),
    planId
  );
 
  return paymentResult;
};

const getAllServices = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Service.find()
      .populate("service_category")
      .populate("offer_services")
      .populate("provider", "name email subscriptionInfo"),
    query
  );

  const servicesData = queryBuilder
    .filter()
    .search(serviceSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    servicesData.build(),
    queryBuilder.getMeta(),
  ]);

  const sortedData = [...data].sort((a: any, b: any) => {
    const aScore = a?.provider?.subscriptionInfo?.priorityScore || 0;
    const bScore = b?.provider?.subscriptionInfo?.priorityScore || 0;
    return bScore - aScore;
  });

  return { data: sortedData, meta };
};

const getSingleService = async (id: string) => {
  const service = await Service.findById(id)
    .populate("service_category")
    .populate("offer_services")
    .populate("provider", "name email subscriptionInfo")
    .populate("highlight_services");     // Populate the highlight_services
    

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service is not found");
  }

  // Calculate and update average rating
  const ratingMap = await aggregateRatings([service._id]);
  const ratingData = ratingMap.get(service._id.toString());
  
  if (ratingData) {
    service.averageRating = parseFloat(ratingData.averageRating.toFixed(1));
    await Service.findByIdAndUpdate(
      service._id,
      { averageRating: service.averageRating },
      { new: false }
    );
  }

  // Fire-and-forget view tracking
  ServiceAnalytics.create({ service: service._id, type: 'view' }).catch(() => {});

  return service;
};

// ─── Get Nearest Services ─────────────────────────────────────────────────────
const getNearestServices = async (
  lon: string,
  lat: string,
  minRating?: number,
  radius?: number,
  categories?: string | string[]
) => {
  if (!lat || !lon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Location not provided");
  }

  const userLon = parseFloat(lon);
  const userLat = parseFloat(lat);
  const radiusInMeters = (radius ?? 10) * 1609.34;

  const services = await Service.find(
    buildGeoQuery(userLon, userLat, radiusInMeters, categories)
  )
    .select(SERVICE_SELECT)
    .populate("provider", PROVIDER_SELECT);

  const ratingMap = await aggregateRatings(services.map((s) => s._id));

  let result = services.map((service) =>
    buildServiceMeta(service, ratingMap, userLon, userLat)
  );

  if (minRating) {
    result = result.filter((s) => s.averageRating >= minRating);
  }

  result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);

  if (result.length > 0) {
    ServiceAnalytics.insertMany(
      result.map((s) => ({ service: s._id, type: 'impression' })),
      { ordered: false }
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    ).catch(() => { }); // fire-and-forget, never block the response
  }

  return result;
};

// ─── Search Services ──────────────────────────────────────────────────────────
const searchServices = async (
  lon: string,
  lat: string,
  searchTerm: string,
  limit?: number
) => {
  if (!lat || !lon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Location not provided");
  }

  const userLon = parseFloat(lon);
  const userLat = parseFloat(lat);

  const services = await Service.find({
    service_name: { $regex: `\\b${searchTerm}`, $options: "i" },
  })
    .select(SERVICE_SELECT)
    .populate("provider", PROVIDER_SELECT);

  const ratingMap = await aggregateRatings(services.map((s) => s._id));

  let result = services.map((service) =>
    buildServiceMeta(service, ratingMap, userLon, userLat)
  );

  result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);

  const total = result.length;

  if (limit) {
    result = result.slice(0, limit);
  }

  return { data: result, total, showing: result.length };
};

// ─── Get Services By Category (Page 2 right panel) ───────────────────────────
/**
 * Fetches services that belong to a category and all its descendants.
 *
 * Matching strategy (OR logic):
 *   1. service_category is in the resolved category ID set
 *   2. offer_services contains any ID from the resolved category ID set
 *
 * This means a shop is shown if its main category OR any of its
 * offered sub-services falls within the selected category tree.
 *
 * Filter chain (applied in this order):
 *   1. Resolve category tree → collect all descendant IDs
 *   2. If offerServiceIds provided → narrow to those specific IDs only
 *   3. DB query: match service_category OR offer_services + optional geo radius
 *   4. Optional searchTerm on service_name
 *   5. Post-query: minRating filter
 *   6. Post-query: availability filter (isAvailableNow)
 *   7. Sort by provider priorityScore DESC
 */

const getServicesByCategory = async ({
  categoryId,
  lon,
  lat,
  offerServiceIds,
  searchTerm,
  minRating,
  radius,
  availability,
}: GetServicesByCategoryParams) => {
  if (!lat || !lon) {
    throw new AppError(httpStatus.BAD_REQUEST, "Location not provided");
  }

  const userLon = parseFloat(lon);
  const userLat = parseFloat(lat);

  // ── Step 1: Resolve all category IDs in the tree ─────────────────────────
  // e.g. clicking "Trades & Services" (level 0) resolves to its own ID +
  // all sub-category IDs + all child-category IDs.
  const allCategoryIds = await getAllDescendantCategoryIds(categoryId);

  // ── Step 2: If specific checkboxes are ticked, narrow to those IDs ────────
  // offerServiceIds are the leaf-level IDs the user selected via checkbox.
  // We only keep IDs that genuinely belong to this category's tree
  // (prevents tampering with unrelated category IDs).
  const targetIds =
    offerServiceIds && offerServiceIds.length > 0
      ? offerServiceIds.filter((id) => allCategoryIds.includes(id))
      : allCategoryIds;

  if (targetIds.length === 0) {
    return { data: [], total: 0 };
  }

  // ── Step 3: Build the MongoDB filter ─────────────────────────────────────
  const dbQuery: any = {
    $or: [
      { service_category: { $in: targetIds } },
      { offer_services: { $in: targetIds } },
    ],
  };

  // Optional: geo radius filter applied at DB level for performance
  if (radius) {
    const radiusInMeters = radius * 1609.34;
    dbQuery.location = {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [userLon, userLat] },
        $maxDistance: radiusInMeters,
      },
    };
  }

  // Optional: service name search
  if (searchTerm) {
    dbQuery.service_name = { $regex: `\\b${searchTerm}`, $options: "i" };
  }

  // ── Step 4: Fetch services ────────────────────────────────────────────────
  const services = await Service.find(dbQuery)
    .select(SERVICE_SELECT)
    .populate("provider", PROVIDER_SELECT);

  // ── Step 5: Build enriched meta (rating, distance, availability) ──────────
  const ratingMap = await aggregateRatings(services.map((s) => s._id));

  let result = services.map((service) =>
    buildServiceMeta(service, ratingMap, userLon, userLat)
  );

  // ── Step 6: Post-query filters ────────────────────────────────────────────
  if (minRating !== undefined) {
    result = result.filter((s) => s.averageRating >= minRating);
  }

  if (availability === true) {
    result = result.filter((s) => s.isAvailableNow === true);
  }

  // ── Step 7: Sort by subscription priority ────────────────────────────────
  result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);

  if (result.length > 0) {
    ServiceAnalytics.insertMany(
      result.map((s) => ({ service: s._id, type: 'impression' })),
      { ordered: false }
    ).catch(() => { }); // fire-and-forget
  }

  return { data: result, total: result.length };
};

// ─── Update & Delete ─────────────────────────────────────────────────────────
const updateService = async (
  id: string,
  payload: Partial<IService>,
  user: any
) => {
  const service = await Service.findById(id);

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  if (
    user.role === Role.PROVIDER &&
    service.provider?.toString() !== user.userId.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (payload.offer_services) {
    await enforceOfferServicesLimit(user.userId, payload.offer_services.length);
  }

  if (payload.media) {
    await enforcePhotoLimit(user.userId, 0, payload.media.length);
  }

  const updatedService = await Service.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("service_category")
    .populate("offer_services")
    .populate("provider", "name email subscriptionInfo");

  return updatedService;
};

const deleteService = async (id: string, user: any) => {
  if (!user || !user.userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const service = await Service.findById(id);

  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service is not found");
  }

  if (
    user.role === Role.PROVIDER &&
    service.provider &&
    service.provider.toString() !== user.userId.toString()
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  await Service.findByIdAndDelete(id);

  if (service.provider) {
    await User.findByIdAndUpdate(service.provider, { hasService: false });
  }
};

export const ServiceServices = {
  createService,
  getSingleService,
  getAllServices,
  getNearestServices,
  searchServices,
  getServicesByCategory,
  updateService,
  deleteService,
};