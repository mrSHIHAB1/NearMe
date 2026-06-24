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
exports.SuperAdminController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const superAdmin_service_1 = require("./superAdmin.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
/* ================================================================== */
/*  DASHBOARD                                                           */
/* ================================================================== */
/**
 * GET /super-admin/dashboard
 * Returns platform stats, provider status breakdown, and growth chart.
 */
const getDashboard = (0, catchAsync_1.catchAsync)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield superAdmin_service_1.SuperAdminService.getDashboardStats();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Dashboard stats retrieved successfully",
        data,
    });
}));
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
const getServiceProviders = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.query.status || "all";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const validStatuses = [
        "all", "pending", "paid", "on_free_trial", "suspended",
    ];
    if (!validStatuses.includes(status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    const result = yield superAdmin_service_1.SuperAdminService.getServiceProviders(status, page, limit, search);
    (0, sendResponse_1.sendResponse)(res, Object.assign({ success: true, statusCode: http_status_codes_1.default.OK, message: "Service providers retrieved successfully", data: result.data, meta: result.meta }, (result.counts && { counts: result.counts })));
}));
/**
 * PATCH /super-admin/service-providers/:serviceId/suspend
 * Suspends the provider account (blocks user + deactivates service).
 */
const suspendServiceProvider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    yield superAdmin_service_1.SuperAdminService.suspendServiceProvider(serviceId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service provider suspended successfully",
        data: null,
    });
}));
/**
 * DELETE /super-admin/service-providers/:serviceId/withdraw
 * Permanently removes the service and soft-deletes the provider account.
 */
/**
 * PATCH /super-admin/service-providers/:serviceId/unsuspend
 * Unsuspends/reactivates the provider account (unblocks user + reactivates service).
 */
const unsuspendServiceProvider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    yield superAdmin_service_1.SuperAdminService.unsuspendServiceProvider(serviceId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service provider unsuspended successfully",
        data: null,
    });
}));
/**
 * DELETE /super-admin/service-providers/:serviceId/withdraw
 * Permanently removes the service and soft-deletes the provider account.
 */
const withdrawServiceProvider = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    yield superAdmin_service_1.SuperAdminService.withdrawServiceProvider(serviceId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service provider withdrawn successfully",
        data: null,
    });
}));
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
const getUsers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.query.status || "all";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const validStatuses = ["all", "active", "blocked"];
    if (!validStatuses.includes(status)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    const result = yield superAdmin_service_1.SuperAdminService.getUsers(status, page, limit, search);
    (0, sendResponse_1.sendResponse)(res, Object.assign({ success: true, statusCode: http_status_codes_1.default.OK, message: "Users retrieved successfully", data: result.data, meta: result.meta }, (result.counts && { counts: result.counts })));
}));
/**
 * PATCH /super-admin/users/:userId/block
 * Blocks a user account.
 */
const blockUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    yield superAdmin_service_1.SuperAdminService.blockUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User blocked successfully",
        data: null,
    });
}));
/**
 * PATCH /super-admin/users/:userId/unblock
 * Restores a blocked user account.
 */
const unblockUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    yield superAdmin_service_1.SuperAdminService.unblockUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User unblocked successfully",
        data: null,
    });
}));
/**
 * DELETE /super-admin/users/:userId
 * Permanently deletes a user account.
 */
const deleteUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    yield superAdmin_service_1.SuperAdminService.deleteUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User deleted successfully",
        data: null,
    });
}));
/* ================================================================== */
/*  REVENUE                                                             */
/* ================================================================== */
/**
 * GET /super-admin/revenue
 * Query params:
 *   page  : number (default 1)  — for payment log pagination
 *   limit : number (default 10)
 */
const getRevenue = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = yield superAdmin_service_1.SuperAdminService.getRevenueData(page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Revenue data retrieved successfully",
        data,
    });
}));
/**
 * GET /super-admin/service-summary
 * Query params:
 *   days : number (how many days ahead counts as "expiring soon")
 */
const getServiceSummary = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const days = parseInt(req.query.days) || 7;
    const data = yield superAdmin_service_1.SuperAdminService.getServiceSummary(days);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Service summary retrieved successfully",
        data,
    });
}));
/* ================================================================== */
/*  EXPORTS                                                             */
/* ================================================================== */
exports.SuperAdminController = {
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
    getServiceSummary,
};
