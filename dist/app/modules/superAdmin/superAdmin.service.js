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
exports.SuperAdminService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const service_model_1 = require("../service/service.model");
const payment_model_1 = __importDefault(require("../payment/payment.model"));
const serviceAnalytics_model_1 = require("../serviceAnalytics/serviceAnalytics.model");
const user_interface_1 = require("../user/user.interface");
// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const buildPaginationMeta = (total, page, limit) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
});
/* ================================================================== */
/*  1. DASHBOARD                                                        */
/* ================================================================== */
/**
 * Returns:
 *  - totalServiceProviders  (all providers)
 *  - totalUsers             (role = USER)
 *  - onFreeTrial            (subscriptionStatus = active AND plan = free)
 *  - totalRevenue           (sum of all PAID payments)
 *  - providerStatus         { paid, onFreeTrial }  ← NO "Trial Expired"
 *  - platformGrowth         monthly providers & revenue (last 7 months)
 */
const getDashboardStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const now = new Date();
    // ── Counts ────────────────────────────────────────────────────────
    const [totalServiceProviders, totalUsers] = yield Promise.all([
        user_model_1.User.countDocuments({ role: user_interface_1.Role.PROVIDER }),
        user_model_1.User.countDocuments({ role: user_interface_1.Role.USER }),
    ]);
    // Providers on free trial: subscriptionStatus=active AND plan name=free
    const freeTrialServices = yield service_model_1.Service.find({
        subscriptionStatus: "active",
    })
        .populate("activePlan", "name")
        .lean();
    const onFreeTrial = freeTrialServices.filter((s) => { var _a; return ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) === "free"; }).length;
    const paidProviders = freeTrialServices.filter((s) => { var _a; return ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) && s.activePlan.name !== "free"; }).length;
    // ── Total Revenue ─────────────────────────────────────────────────
    const revenueAgg = yield payment_model_1.default.aggregate([
        { $match: { payment_status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = ((_a = revenueAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // ── Platform Growth (last 7 calendar months) ──────────────────────
    const sevenMonthsAgo = new Date(now);
    sevenMonthsAgo.setMonth(now.getMonth() - 6);
    sevenMonthsAgo.setDate(1);
    sevenMonthsAgo.setHours(0, 0, 0, 0);
    const [providerGrowthRaw, revenueGrowthRaw] = yield Promise.all([
        user_model_1.User.aggregate([
            {
                $match: {
                    role: user_interface_1.Role.PROVIDER,
                    createdAt: { $gte: sevenMonthsAgo },
                },
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
        ]),
        payment_model_1.default.aggregate([
            {
                $match: {
                    payment_status: "PAID",
                    createdAt: { $gte: sevenMonthsAgo },
                },
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    revenue: { $sum: "$amount" },
                },
            },
        ]),
    ]);
    const providerMap = new Map(providerGrowthRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));
    const revenueMap = new Map(revenueGrowthRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.revenue]));
    const platformGrowth = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        platformGrowth.push({
            month: MONTHS[d.getMonth()],
            providers: providerMap.get(key) || 0,
            revenue: revenueMap.get(key) || 0,
        });
    }
    return {
        totalServiceProviders,
        totalUsers,
        onFreeTrial,
        totalRevenue,
        providerStatus: {
            paid: paidProviders,
            onFreeTrial,
        },
        platformGrowth,
    };
});
/* ================================================================== */
/*  2. SERVICE PROVIDERS LIST                                           */
/* ================================================================== */
/**
 * Returns paginated list of service providers with filters:
 *   all | pending | paid | on_free_trial | suspended
 *
 * "pending"      → subscriptionStatus = "inactive"
 * "paid"         → subscriptionStatus = "active" AND plan != free
 * "on_free_trial"→ subscriptionStatus = "active" AND plan = free
 * "suspended"    → provider user isActive = BLOCKED
 */
const getServiceProviders = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (status = "all", page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    // ── Build base service filter ─────────────────────────────────────
    // eslint-disable-next-line prefer-const
    let serviceFilter = {};
    if (status === "pending") {
        serviceFilter.subscriptionStatus = "inactive";
    }
    else if (status === "paid") {
        serviceFilter.subscriptionStatus = "active";
    }
    else if (status === "on_free_trial") {
        serviceFilter.subscriptionStatus = "active";
    }
    // "suspended" and "all" handled via user isActive filter
    // ── Fetch matching services with provider populated ────────────────
    const populateOptions = {
        path: "provider",
        select: "name email picture isActive role",
    };
    let services = yield service_model_1.Service.find(serviceFilter)
        .populate(populateOptions)
        .populate("service_category", "name")
        .populate("activePlan", "name title")
        .lean();
    // ── Post-populate filters ─────────────────────────────────────────
    if (status === "paid") {
        services = services.filter((s) => { var _a; return ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) && s.activePlan.name !== "free"; });
    }
    else if (status === "on_free_trial") {
        services = services.filter((s) => { var _a; return !s.activePlan || ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) === "free"; });
    }
    else if (status === "suspended") {
        services = services.filter((s) => { var _a; return ((_a = s.provider) === null || _a === void 0 ? void 0 : _a.isActive) === user_interface_1.IsActive.BLOCKED; });
    }
    // ── Search filter ─────────────────────────────────────────────────
    if (search) {
        const regex = new RegExp(search, "i");
        services = services.filter((s) => {
            var _a, _b;
            return regex.test(s.service_name || "") ||
                regex.test(((_a = s.provider) === null || _a === void 0 ? void 0 : _a.name) || "") ||
                regex.test(((_b = s.provider) === null || _b === void 0 ? void 0 : _b.email) || "");
        });
    }
    // ── Count tabs (always from full unfiltered set) ──────────────────
    const allServices = yield service_model_1.Service.find()
        .populate("provider", "isActive")
        .populate("activePlan", "name")
        .lean();
    const counts = {
        all: allServices.length,
        pending: allServices.filter((s) => s.subscriptionStatus === "inactive").length,
        paid: allServices.filter((s) => {
            var _a;
            return s.subscriptionStatus === "active" &&
                ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) &&
                s.activePlan.name !== "free";
        }).length,
        onFreeTrial: allServices.filter((s) => {
            var _a;
            return s.subscriptionStatus === "active" &&
                (!s.activePlan || ((_a = s.activePlan) === null || _a === void 0 ? void 0 : _a.name) === "free");
        }).length,
        suspended: allServices.filter((s) => { var _a; return ((_a = s.provider) === null || _a === void 0 ? void 0 : _a.isActive) === user_interface_1.IsActive.BLOCKED; }).length,
    };
    // ── Pagination ────────────────────────────────────────────────────
    const total = services.length;
    const paginated = services.slice(skip, skip + limit);
    // ── Enrich with analytics counts ─────────────────────────────────
    const serviceIds = paginated.map((s) => s._id);
    const [impressionCounts, viewCounts] = yield Promise.all([
        serviceAnalytics_model_1.ServiceAnalytics.aggregate([
            { $match: { service: { $in: serviceIds }, type: "impression" } },
            { $group: { _id: "$service", count: { $sum: 1 } } },
        ]),
        serviceAnalytics_model_1.ServiceAnalytics.aggregate([
            { $match: { service: { $in: serviceIds }, type: "view" } },
            { $group: { _id: "$service", count: { $sum: 1 } } },
        ]),
    ]);
    const impressionMap = new Map(impressionCounts.map((r) => [r._id.toString(), r.count]));
    const viewMap = new Map(viewCounts.map((r) => [r._id.toString(), r.count]));
    const data = paginated.map((s) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return ({
            _id: s._id.toString(),
            provider: {
                _id: ((_b = (_a = s.provider) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                name: ((_c = s.provider) === null || _c === void 0 ? void 0 : _c.name) || "",
                email: ((_d = s.provider) === null || _d === void 0 ? void 0 : _d.email) || "",
                picture: (_e = s.provider) === null || _e === void 0 ? void 0 : _e.picture,
                isActive: ((_f = s.provider) === null || _f === void 0 ? void 0 : _f.isActive) || user_interface_1.IsActive.ACTIVE,
            },
            service_name: s.service_name || "",
            service_category: s.service_category
                ? { _id: (_g = s.service_category._id) === null || _g === void 0 ? void 0 : _g.toString(), name: s.service_category.name }
                : null,
            service_address: s.service_address || "",
            subscriptionStatus: s.subscriptionStatus || "inactive",
            activePlan: s.activePlan
                ? { _id: (_h = s.activePlan._id) === null || _h === void 0 ? void 0 : _h.toString(), name: s.activePlan.name, title: s.activePlan.title }
                : null,
            subscriptionExpiresAt: s.subscriptionExpiresAt || null,
            impressions: impressionMap.get(s._id.toString()) || 0,
            views: viewMap.get(s._id.toString()) || 0,
            averageRating: s.averageRating || 0,
        });
    });
    return {
        data,
        meta: buildPaginationMeta(total, page, limit),
        counts,
    };
});
/* ================================================================== */
/*  3. SUSPEND / WITHDRAW SERVICE PROVIDER                             */
/* ================================================================== */
/**
 * Suspend: sets provider user isActive = BLOCKED, service subscriptionStatus = "inactive"
 * Withdraw: hard-deletes the service AND the provider user account
 */
const suspendServiceProvider = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findById(serviceId);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service not found");
    }
    if (!service.provider) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Service has no provider");
    }
    yield Promise.all([
        user_model_1.User.findByIdAndUpdate(service.provider, { isActive: user_interface_1.IsActive.BLOCKED }),
        service_model_1.Service.findByIdAndUpdate(serviceId, { subscriptionStatus: "inactive" }),
    ]);
});
const unsuspendServiceProvider = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findById(serviceId);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service not found");
    }
    if (!service.provider) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Service has no provider");
    }
    yield Promise.all([
        user_model_1.User.findByIdAndUpdate(service.provider, { isActive: user_interface_1.IsActive.ACTIVE }),
        service_model_1.Service.findByIdAndUpdate(serviceId, { subscriptionStatus: "active" }),
    ]);
});
const withdrawServiceProvider = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const service = yield service_model_1.Service.findById(serviceId);
    if (!service) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Service not found");
    }
    const providerId = service.provider;
    // Delete service + mark user as deleted
    yield Promise.all([
        service_model_1.Service.findByIdAndDelete(serviceId),
        providerId
            ? user_model_1.User.findByIdAndUpdate(providerId, {
                isDeleted: true,
                hasService: false,
                isActive: user_interface_1.IsActive.INACTIVE,
            })
            : Promise.resolve(),
    ]);
});
/* ================================================================== */
/*  4. USERS LIST                                                       */
/* ================================================================== */
/**
 * Returns paginated list of regular users (role = USER).
 * Filters: all | active | blocked
 * No reviews column — just name, email, location, joined date, status
 */
const getUsers = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (status = "all", page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit;
    const baseFilter = { role: user_interface_1.Role.USER, isDeleted: false };
    if (status === "active") {
        baseFilter.isActive = user_interface_1.IsActive.ACTIVE;
    }
    else if (status === "blocked") {
        baseFilter.isActive = user_interface_1.IsActive.BLOCKED;
    }
    if (search) {
        baseFilter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [users, total, activeCount, blockedCount] = yield Promise.all([
        user_model_1.User.find(baseFilter)
            .select("name email picture isActive coord createdAt")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean(),
        user_model_1.User.countDocuments(baseFilter),
        user_model_1.User.countDocuments({ role: user_interface_1.Role.USER, isDeleted: false, isActive: user_interface_1.IsActive.ACTIVE }),
        user_model_1.User.countDocuments({ role: user_interface_1.Role.USER, isDeleted: false, isActive: user_interface_1.IsActive.BLOCKED }),
    ]);
    const totalAll = yield user_model_1.User.countDocuments({ role: user_interface_1.Role.USER, isDeleted: false });
    const data = users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        picture: u.picture,
        location: u.coord ? `${u.coord.lat}, ${u.coord.lon}` : undefined,
        isActive: u.isActive || user_interface_1.IsActive.ACTIVE,
        createdAt: u.createdAt,
    }));
    return {
        data,
        meta: buildPaginationMeta(total, page, limit),
        counts: {
            total: totalAll,
            active: activeCount,
            blocked: blockedCount,
        },
    };
});
/* ================================================================== */
/*  5. BLOCK / UNBLOCK USER                                             */
/* ================================================================== */
const blockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.role !== user_interface_1.Role.USER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Can only block regular users");
    }
    yield user_model_1.User.findByIdAndUpdate(userId, { isActive: user_interface_1.IsActive.BLOCKED });
});
const unblockUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    yield user_model_1.User.findByIdAndUpdate(userId, { isActive: user_interface_1.IsActive.ACTIVE });
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot delete super admin users");
    }
    yield user_model_1.User.findByIdAndDelete(userId);
});
/* ================================================================== */
/*  6. REVENUE                                                          */
/* ================================================================== */
/**
 * Returns:
 *  - stats: lifetime / this month / today revenue
 *  - monthlyRevenue: current year, monthly breakdown
 *  - dailyRegistrations: last 7 days new user signups
 *  - paymentLog: paginated PAID payment records
 */
const getRevenueData = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, limit = 10) {
    var _a, _b, _c;
    const skip = (page - 1) * limit;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentYear = now.getFullYear();
    // ── Revenue Stats ─────────────────────────────────────────────────
    const [lifetimeAgg, monthAgg, todayAgg] = yield Promise.all([
        payment_model_1.default.aggregate([
            { $match: { payment_status: "PAID" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        payment_model_1.default.aggregate([
            { $match: { payment_status: "PAID", createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        payment_model_1.default.aggregate([
            { $match: { payment_status: "PAID", createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
    ]);
    const stats = {
        lifetimeRevenue: ((_a = lifetimeAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
        thisMonthRevenue: ((_b = monthAgg[0]) === null || _b === void 0 ? void 0 : _b.total) || 0,
        todayRevenue: ((_c = todayAgg[0]) === null || _c === void 0 ? void 0 : _c.total) || 0,
    };
    // ── Monthly Revenue (current year) ───────────────────────────────
    const monthlyRaw = yield payment_model_1.default.aggregate([
        {
            $match: {
                payment_status: "PAID",
                createdAt: {
                    $gte: new Date(`${currentYear}-01-01`),
                    $lte: new Date(`${currentYear}-12-31T23:59:59`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                revenue: { $sum: "$amount" },
            },
        },
    ]);
    const monthlyMap = new Map(monthlyRaw.map((r) => [r._id, r.revenue]));
    const monthlyRevenue = MONTHS.map((month, idx) => ({
        month,
        revenue: monthlyMap.get(idx + 1) || 0,
    }));
    // ── Daily Registrations (last 7 days) ────────────────────────────
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const dailyRaw = yield user_model_1.User.aggregate([
        {
            $match: {
                role: { $ne: user_interface_1.Role.SUPER_ADMIN },
                createdAt: { $gte: sevenDaysAgo },
            },
        },
        {
            $group: {
                _id: { $dayOfWeek: "$createdAt" }, // 1=Sun...7=Sat
                count: { $sum: 1 },
            },
        },
    ]);
    const dailyMap = new Map(dailyRaw.map((r) => [r._id, r.count]));
    // Map to last 7 days in order
    const dailyRegistrations = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dayOfWeek = d.getDay() + 1; // getDay()=0-6, $dayOfWeek=1-7
        const dayName = WEEK_DAYS[(d.getDay() + 6) % 7]; // Mon=0...Sun=6
        dailyRegistrations.push({
            day: dayName,
            count: dailyMap.get(dayOfWeek) || 0,
        });
    }
    // ── Payment Log (paginated) ───────────────────────────────────────
    const [payments, totalPayments] = yield Promise.all([
        payment_model_1.default.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        payment_model_1.default.countDocuments(),
    ]);
    const paymentLogData = payments.map((p) => {
        var _a, _b, _c, _d;
        return ({
            _id: p._id.toString(),
            transaction_id: p.transaction_id,
            provider: {
                _id: ((_b = (_a = p.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                name: ((_c = p.user) === null || _c === void 0 ? void 0 : _c.name) || "Unknown",
                email: ((_d = p.user) === null || _d === void 0 ? void 0 : _d.email) || "",
            },
            amount: p.amount,
            currency: p.currency || "GBP",
            payment_status: p.payment_status,
            createdAt: p.createdAt,
            payment_intent_id: p.payment_intent_id,
        });
    });
    return {
        stats,
        monthlyRevenue,
        dailyRegistrations,
        paymentLog: {
            data: paymentLogData,
            meta: buildPaginationMeta(totalPayments, page, limit),
        },
    };
});
/* ================================================================== */
/*  EXPORTS                                                             */
/* ================================================================== */
exports.SuperAdminService = {
    getDashboardStats,
    getServiceProviders,
    suspendServiceProvider,
    unsuspendServiceProvider,
    withdrawServiceProvider,
    getUsers,
    blockUser,
    unblockUser,
    deleteUser,
    getRevenueData,
};
