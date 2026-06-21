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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const service_service_1 = require("./service.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
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
const createService = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = req.user;
    const files = req.files;
    const payload = Object.assign(Object.assign({}, req.body), { media: ((_a = files === null || files === void 0 ? void 0 : files.media) === null || _a === void 0 ? void 0 : _a.map((file) => file.path)) || [], company_logo: ((_c = (_b = files === null || files === void 0 ? void 0 : files.company_logo) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.path) || "" });
    console.log("Received create service request with payload:", payload);
    const result = yield service_service_1.ServiceServices.createService(payload, user.userId);
    if ("free" in result) {
        return (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.CREATED,
            message: "Service created and free plan activated successfully",
            data: result, // { free: true }
        });
    }
    return (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Service created. Redirecting to payment...",
        data: result, // { checkout_url: "https://checkout.stripe.com/..." }
    });
}));
const getAllServices = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield service_service_1.ServiceServices.getAllServices(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "All Services Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
}));
const getSingleService = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const service = yield service_service_1.ServiceServices.getSingleService(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Get single service successfully",
        data: service,
    });
}));
// Controller to get nearest services based on user location
const getNearestServices = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lon, lat, minRating, radius, categories } = req.body;
    const services = yield service_service_1.ServiceServices.getNearestServices(lon, lat, minRating ? parseFloat(minRating) : undefined, radius ? parseFloat(radius) : undefined, categories);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Nearest services retrieved successfully",
        data: services,
    });
}));
const searchServices = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lon, lat, searchTerm, viewAll } = req.query;
    if (!searchTerm) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "searchTerm is required");
    }
    const limit = viewAll === "true" ? undefined : 3;
    const result = yield service_service_1.ServiceServices.searchServices(lon, lat, searchTerm, limit);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Search results retrieved successfully",
        data: result.data,
        meta: { total: result.total, showing: result.showing },
    });
}));
/**
 * POST /services/by-category
 *
 * Powers the RIGHT PANEL of page 2.
 *
 * Body:
 * {
 *   categoryId:          string         ← required. The root/sub/child category ID clicked.
 *   lon:                 string         ← required. User longitude.
 *   lat:                 string         ← required. User latitude.
 *
 *   // ── optional filters ──────────────────────────────────────────────────
 *   service_subCategory: string         ← optional. Filter by sub-category ID.
 *   service_childCategory: string|string[] ← optional. Filter by child-category ID(s).
 *   offerServiceIds:     string[]       ← specific sub/child category IDs selected via checkboxes.
 *                                         If omitted → all descendants are included.
 *   searchTerm:          string         ← free-text search on service_name.
 *   minRating:           number         ← e.g. 4.0
 *   radius:              number         ← in miles (default 10)
 *   availability:        boolean        ← true = show only currently open services
 * }
 *
 * Response data shape (each item):
 * {
 *   _id, service_name, company_logo, coordinates,
 *   distanceInMiles, averageRating, totalReviews, isAvailableNow,
 *   provider: { planName, badgeType, priorityScore }
 * }
 */
const getServicesByCategory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, lon, lat, offerServiceIds, searchTerm, minRating, radius, availability, service_subCategory, service_childCategory, } = req.body;
    if (!categoryId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "categoryId is required");
    }
    const result = yield service_service_1.ServiceServices.getServicesByCategory({
        categoryId,
        lon,
        lat,
        offerServiceIds,
        searchTerm,
        minRating: minRating ? parseFloat(minRating) : undefined,
        radius: radius ? parseFloat(radius) : undefined,
        availability: availability !== undefined ? availability === true || availability === "true" : undefined,
        service_subCategory,
        service_childCategory,
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Services retrieved successfully",
        data: result.data,
        meta: { total: result.total },
    });
}));
const updateService = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const serviceId = req.params.id;
    const files = req.files;
    const payload = Object.assign({}, req.body);
    if (files === null || files === void 0 ? void 0 : files.media) {
        payload.media = files.media.map((file) => file.path);
    }
    if ((_a = files === null || files === void 0 ? void 0 : files.company_logo) === null || _a === void 0 ? void 0 : _a[0]) {
        payload.company_logo = files.company_logo[0].path;
    }
    const service = yield service_service_1.ServiceServices.updateService(serviceId, payload, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service updated successfully",
        data: service,
    });
}));
const deleteService = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const id = req.params.id;
    yield service_service_1.ServiceServices.deleteService(id, user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service deleted successfully",
        data: null,
    });
}));
/**
 * GET /service/my-service
 *
 * Retrieves the authenticated provider's own service
 * Requires: PROVIDER role
 * Returns: Full service details with ratings and all relationships
 */
const getMyService = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const service = yield service_service_1.ServiceServices.getMyService(user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your service retrieved successfully",
        data: service,
    });
}));
exports.ServiceControllers = {
    createService,
    getAllServices,
    getNearestServices,
    searchServices,
    getServicesByCategory,
    updateService,
    getSingleService,
    deleteService,
    getMyService,
};
