"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceServices = void 0;
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const service_model_1 = require("./service.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const service_constant_1 = require("./service.constant");
const enforceCategoryLimit_1 = require("../../utils/subscriptionHelper/enforceCategoryLimit");
const enforcePhotoLimit_1 = require("../../utils/subscriptionHelper/enforcePhotoLimit");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const review_model_1 = require("../review/review.model");
const buildServiceMeta_1 = require("../../utils/getNearestServicesHelper/buildServiceMeta");
const checkIsAvailableNow_1 = require("../../utils/getNearestServicesHelper/checkIsAvailableNow");
const getNearestServicesQuery_1 = require("../../utils/getNearestServicesHelper/getNearestServicesQuery");
const category_service_1 = require("../category/category.service");
const serviceAnalytics_model_1 = require("../serviceAnalytics/serviceAnalytics.model");
const plan_model_1 = require("../plan/plan.model");
const getEffectivePlan_1 = require("../../utils/subscriptionHelper/getEffectivePlan");
// ─── Shared: aggregate ratings for a list of serviceIds ───────────────────────
const aggregateRatings = (serviceIds) => __awaiter(void 0, void 0, void 0, function* () {
    const ratingAggregates = yield review_model_1.Review.aggregate([
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
});
// ─── Shared: slim select + provider populate ──────────────────────────────────
const SERVICE_SELECT = "_id service_name company_logo location openingTime closingTime allTimeAvailability service_address averageRating service_subCategory service_childCategory";
const PROVIDER_SELECT = "name subscriptionInfo.planName subscriptionInfo.badgeType subscriptionInfo.priorityScore";
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
const createService = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    /* ── 1. Guard: one service per provider ── */
    const existingService = yield service_model_1.Service.findOne({ provider: userId });
    console.log(existingService, "Existing service for userId:", userId);
    if (existingService) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "A provider can only create one service");
    }
    /* ── 2. Validate the chosen plan ── */
    const plan = yield plan_model_1.Plan.findById(payload.planId);
    if (!plan || !plan.isActive) {
        console.log(`Plan validation failed for planId: `, plan);
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid or inactive plan selected");
    }
    /* ── 3. Enforce feature limits based on the chosen plan ── */
    const offerServicesCount = ((_a = payload.offer_services) === null || _a === void 0 ? void 0 : _a.length) || 0;
    yield (0, enforceCategoryLimit_1.enforceOfferServicesLimit)(userId, offerServicesCount);
    const incomingPhotosCount = ((_b = payload.media) === null || _b === void 0 ? void 0 : _b.length) || 0;
    yield (0, enforcePhotoLimit_1.enforcePhotoLimit)(userId, 0, incomingPhotosCount);
    /* ── 4. Ensure user is on the selected plan ── */
    const effectivePlan = yield (0, getEffectivePlan_1.getEffectivePlan)(userId);
    if (((_c = effectivePlan === null || effectivePlan === void 0 ? void 0 : effectivePlan._id) === null || _c === void 0 ? void 0 : _c.toString()) !== plan._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Please subscribe to the selected plan before creating a service");
    }
    /* ── 5. Create the service (subscription fields default to active) ── */
    const { planId } = payload, serviceData = __rest(payload, ["planId"]);
    // Fetch provider name to store with the service snapshot
    const providerUser = yield user_model_1.User.findById(userId).select("name");
    const service = yield service_model_1.Service.create(Object.assign(Object.assign({}, serviceData), { provider: userId, provider_name: (providerUser === null || providerUser === void 0 ? void 0 : providerUser.name) || "", subscriptionStatus: "active" }));
    /* ── 6. Link service to user ── */
    yield user_model_1.User.findByIdAndUpdate(userId, {
        service: service._id,
        hasService: true,
    });
    /* ── 7. Payment disabled (Stripe removed) ── */
    return { free: true };
});
const getAllServices = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(service_model_1.Service.find()
        .populate("service_category")
        .populate("offer_services")
        .populate("provider", "name email subscriptionInfo"), query);
    const servicesData = queryBuilder
        .filter()
        .search(service_constant_1.serviceSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        servicesData.build(),
        queryBuilder.getMeta(),
    ]);
    const sortedData = [...data].sort((a, b) => {
        var _a, _b, _c, _d;
        const aScore = ((_b = (_a = a === null || a === void 0 ? void 0 : a.provider) === null || _a === void 0 ? void 0 : _a.subscriptionInfo) === null || _b === void 0 ? void 0 : _b.priorityScore) || 0;
        const bScore = ((_d = (_c = b === null || b === void 0 ? void 0 : b.provider) === null || _c === void 0 ? void 0 : _c.subscriptionInfo) === null || _d === void 0 ? void 0 : _d.priorityScore) || 0;
        return bScore - aScore;
    });
    return { data: sortedData, meta };
});
const getSingleService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findById(id)
        .populate("service_category")
        .populate("offer_services")
        .populate("provider", "name email subscriptionInfo")
        .populate("highlight_services"); // Populate the highlight_services
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service is not found");
    }
    // Calculate and update average rating
    const ratingMap = yield aggregateRatings([service._id]);
    const ratingData = ratingMap.get(service._id.toString());
    if (ratingData) {
        service.averageRating = parseFloat(ratingData.averageRating.toFixed(1));
        yield service_model_1.Service.findByIdAndUpdate(service._id, { averageRating: service.averageRating }, { new: false });
    }
    // Fire-and-forget view tracking
    serviceAnalytics_model_1.ServiceAnalytics.create({ service: service._id, type: 'view' }).catch(() => { });
    // Add `isOpen` flag based on current time and service hours
    const isOpen = (0, checkIsAvailableNow_1.checkIsAvailableNow)(service.openingTime, service.closingTime, service.allTimeAvailability);
    const serviceObj = service.toObject ? service.toObject() : service;
    serviceObj.isOpen = isOpen;
    return serviceObj;
});
// ─── Get Nearest Services ─────────────────────────────────────────────────────
const getNearestServices = (lon, lat, minRating, radius, categories) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lat || !lon) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Location not provided");
    }
    const userLon = parseFloat(lon);
    const userLat = parseFloat(lat);
    // Normalize numeric query params
    const minRatingNum = minRating !== undefined && minRating !== null ? Number(minRating) : undefined;
    const radiusNum = radius !== undefined && radius !== null ? Number(radius) : undefined;
    // If radius and categories are both absent/empty, return all services
    // (this ensures passing only minRating will not cause a geo-radius restriction)
    const categoriesEmpty = categories === undefined || (Array.isArray(categories) && categories.length === 0);
    let services;
    if ((radiusNum === undefined || isNaN(radiusNum)) && categoriesEmpty) {
        services = yield service_model_1.Service.find()
            .select(SERVICE_SELECT)
            .populate("provider", PROVIDER_SELECT);
    }
    else {
        const radiusInMeters = (radiusNum !== null && radiusNum !== void 0 ? radiusNum : 10) * 1609.34;
        services = yield service_model_1.Service.find((0, getNearestServicesQuery_1.buildGeoQuery)(userLon, userLat, radiusInMeters, categories))
            .select(SERVICE_SELECT)
            .populate("provider", PROVIDER_SELECT);
    }
    const ratingMap = yield aggregateRatings(services.map((s) => s._id));
    let result = services.map((service) => (0, buildServiceMeta_1.buildServiceMeta)(service, ratingMap, userLon, userLat));
    if (minRatingNum !== undefined && !isNaN(minRatingNum)) {
        result = result.filter((s) => s.averageRating >= minRatingNum);
    }
    result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);
    if (result.length > 0) {
        serviceAnalytics_model_1.ServiceAnalytics.insertMany(result.map((s) => ({ service: s._id, type: 'impression' })), { ordered: false }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        ).catch(() => { }); // fire-and-forget, never block the response
    }
    return result;
});
// ─── Search Services ──────────────────────────────────────────────────────────
const searchServices = (lon, lat, searchTerm, limit) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lat || !lon) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Location not provided");
    }
    const userLon = parseFloat(lon);
    const userLat = parseFloat(lat);
    const services = yield service_model_1.Service.find({
        service_name: { $regex: `\\b${searchTerm}`, $options: "i" },
    })
        .select(SERVICE_SELECT)
        .populate("provider", PROVIDER_SELECT);
    const ratingMap = yield aggregateRatings(services.map((s) => s._id));
    let result = services.map((service) => (0, buildServiceMeta_1.buildServiceMeta)(service, ratingMap, userLon, userLat));
    result.sort((a, b) => b.provider.priorityScore - a.provider.priorityScore);
    const total = result.length;
    if (limit) {
        result = result.slice(0, limit);
    }
    return { data: result, total, showing: result.length };
});
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
const getServicesByCategory = (_a) => __awaiter(void 0, [_a], void 0, function* ({ categoryId, lon, lat, offerServiceIds, searchTerm, minRating, radius, availability, service_subCategory, service_childCategory, }) {
    if (!lat || !lon) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Location not provided");
    }
    const userLon = parseFloat(lon);
    const userLat = parseFloat(lat);
    // ── Step 1: Determine the primary category to filter by ─────────────────────
    // Priority: service_subCategory > categoryId
    // If service_subCategory is provided, use it; otherwise use categoryId
    const primaryCategoryId = service_subCategory || categoryId;
    const allPrimaryCategoryIds = yield (0, category_service_1.getAllDescendantCategoryIds)(primaryCategoryId);
    // ── Step 1b: Resolve child-category IDs if provided ──────────────────────
    let allChildCategoryIds = [];
    if (service_childCategory) {
        // Handle both string and array of strings
        const childCategoryArray = Array.isArray(service_childCategory)
            ? service_childCategory
            : [service_childCategory];
        for (const childCatId of childCategoryArray) {
            const descendants = yield (0, category_service_1.getAllDescendantCategoryIds)(childCatId);
            allChildCategoryIds = [...new Set([...allChildCategoryIds, ...descendants])];
        }
    }
    // ── Step 2: If specific checkboxes are ticked, narrow to those IDs ────────
    // offerServiceIds are the leaf-level IDs the user selected via checkbox.
    // We only keep IDs that genuinely belong to the primary category's tree
    // (prevents tampering with unrelated category IDs).
    const targetIds = offerServiceIds && offerServiceIds.length > 0
        ? offerServiceIds.filter((id) => allPrimaryCategoryIds.includes(id))
        : allPrimaryCategoryIds;
    if (targetIds.length === 0 && allChildCategoryIds.length === 0) {
        return { data: [], total: 0 };
    }
    // ── Step 3: Build the MongoDB filter ─────────────────────────────────────
    // When service_subCategory is provided, filter ONLY by that field
    // When service_subCategory is NOT provided, filter by service_category or offer_services
    const orConditions = [];
    if (service_subCategory) {
        // Filter ONLY by service_subCategory when it's explicitly provided
        orConditions.push({ service_subCategory: { $in: targetIds } });
    }
    else {
        // Use original category-based filtering when service_subCategory is not provided
        orConditions.push({ service_category: { $in: targetIds } }, { offer_services: { $in: targetIds } });
    }
    // Build the main query with OR conditions
    let dbQuery = {
        $or: orConditions,
    };
    // If child-category filter is provided, apply it with AND logic (narrows results)
    if (allChildCategoryIds.length > 0) {
        dbQuery = {
            $and: [
                { $or: orConditions },
                { service_childCategory: { $in: allChildCategoryIds } }
            ]
        };
    }
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
    const services = yield service_model_1.Service.find(dbQuery)
        .select(SERVICE_SELECT)
        .populate("provider", PROVIDER_SELECT);
    // ── Step 5: Build enriched meta (rating, distance, availability) ──────────
    const ratingMap = yield aggregateRatings(services.map((s) => s._id));
    let result = services.map((service) => (0, buildServiceMeta_1.buildServiceMeta)(service, ratingMap, userLon, userLat));
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
        serviceAnalytics_model_1.ServiceAnalytics.insertMany(result.map((s) => ({ service: s._id, type: 'impression' })), { ordered: false }).catch(() => { }); // fire-and-forget
    }
    return { data: result, total: result.length };
});
// ─── Update & Delete ─────────────────────────────────────────────────────────
const updateService = (id, payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const service = yield service_model_1.Service.findById(id);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service not found");
    }
    if (user.role === user_interface_1.Role.PROVIDER &&
        ((_a = service.provider) === null || _a === void 0 ? void 0 : _a.toString()) !== user.userId.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
    }
    if (payload.offer_services) {
        yield (0, enforceCategoryLimit_1.enforceOfferServicesLimit)(user.userId, payload.offer_services.length);
    }
    if (payload.media) {
        yield (0, enforcePhotoLimit_1.enforcePhotoLimit)(user.userId, 0, payload.media.length);
    }
    const updatedService = yield service_model_1.Service.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    })
        .populate("service_category")
        .populate("offer_services")
        .populate("provider", "name email subscriptionInfo");
    return updatedService;
});
const deleteService = (id, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user || !user.userId) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User not authenticated");
    }
    const service = yield service_model_1.Service.findById(id);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service is not found");
    }
    if (user.role === user_interface_1.Role.PROVIDER &&
        service.provider &&
        service.provider.toString() !== user.userId.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
    }
    yield service_model_1.Service.findByIdAndDelete(id);
    if (service.provider) {
        yield user_model_1.User.findByIdAndUpdate(service.provider, { hasService: false });
    }
});
// ─── Get My Service (Provider's own service) ────────────────────────────────
const getMyService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findOne({ provider: userId })
        .populate("service_category")
        .populate("offer_services")
        .populate("provider", "name email subscriptionInfo")
        .populate("highlight_services");
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "You don't have a service yet. Create one to get started.");
    }
    // Calculate and update average rating
    const ratingMap = yield aggregateRatings([service._id]);
    const ratingData = ratingMap.get(service._id.toString());
    if (ratingData) {
        service.averageRating = parseFloat(ratingData.averageRating.toFixed(1));
        yield service_model_1.Service.findByIdAndUpdate(service._id, { averageRating: service.averageRating }, { new: false });
    }
    return service;
});
exports.ServiceServices = {
    createService,
    getSingleService,
    getAllServices,
    getNearestServices,
    searchServices,
    getServicesByCategory,
    updateService,
    deleteService,
    getMyService,
};
