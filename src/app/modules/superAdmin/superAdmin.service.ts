/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { Service } from "../service/service.model";
import { PaymentModel } from "../payment/payment.model";
import { ServiceAnalytics } from "../serviceAnalytics/serviceAnalytics.model";
import { IsActive, Role } from "../user/user.interface";
import {
  IDashboardStats,
  IProviderListResponse,
  IRevenueResponse,
  IUserListResponse,
  ProviderFilterStatus,
  UserFilterStatus,
} from "./superAdmin.interface";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const buildPaginationMeta = (total: number, page: number, limit: number) => ({
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
const getDashboardStats = async (): Promise<IDashboardStats> => {
  const now = new Date();

  // ── Counts ────────────────────────────────────────────────────────
  const [totalServiceProviders, totalUsers] = await Promise.all([
    User.countDocuments({ role: Role.PROVIDER }),
    User.countDocuments({ role: Role.USER }),
  ]);

  // Providers on free trial: subscriptionStatus=active AND plan name=free
  const freeTrialServices = await Service.find({
    subscriptionStatus: "active",
  })
    .populate("activePlan", "name")
    .lean();

  const onFreeTrial = freeTrialServices.filter(
    (s: any) => s.activePlan?.name === "free"
  ).length;

  const paidProviders = freeTrialServices.filter(
    (s: any) => s.activePlan?.name && s.activePlan.name !== "free"
  ).length;

  // ── Total Revenue ─────────────────────────────────────────────────
  const revenueAgg = await PaymentModel.aggregate([
    { $match: { payment_status: "PAID" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // ── Platform Growth (last 7 calendar months) ──────────────────────
  const sevenMonthsAgo = new Date(now);
  sevenMonthsAgo.setMonth(now.getMonth() - 6);
  sevenMonthsAgo.setDate(1);
  sevenMonthsAgo.setHours(0, 0, 0, 0);

  const [providerGrowthRaw, revenueGrowthRaw] = await Promise.all([
    User.aggregate([
      {
        $match: {
          role: Role.PROVIDER,
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
    PaymentModel.aggregate([
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

  const providerMap = new Map(
    providerGrowthRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.count])
  );
  const revenueMap = new Map(
    revenueGrowthRaw.map((r) => [`${r._id.year}-${r._id.month}`, r.revenue])
  );

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
};

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
const getServiceProviders = async (
  status: ProviderFilterStatus = "all",
  page = 1,
  limit = 10,
  search = ""
): Promise<IProviderListResponse> => {
  const skip = (page - 1) * limit;

  // ── Build base service filter ─────────────────────────────────────
  // eslint-disable-next-line prefer-const
  let serviceFilter: any = {};

  if (status === "pending") {
    serviceFilter.subscriptionStatus = "inactive";
  } else if (status === "paid") {
    serviceFilter.subscriptionStatus = "active";
  } else if (status === "on_free_trial") {
    serviceFilter.subscriptionStatus = "active";
  }
  // "suspended" and "all" handled via user isActive filter

  // ── Fetch matching services with provider populated ────────────────
  const populateOptions: any = {
    path: "provider",
    select: "name email picture isActive role",
  };

  let services = await Service.find(serviceFilter)
    .populate(populateOptions)
    .populate("service_category", "name")
    .populate("activePlan", "name title")
    .lean();

  // ── Post-populate filters ─────────────────────────────────────────
  if (status === "paid") {
    services = services.filter(
      (s: any) => s.activePlan?.name && s.activePlan.name !== "free"
    );
  } else if (status === "on_free_trial") {
    services = services.filter(
      (s: any) => !s.activePlan || s.activePlan?.name === "free"
    );
  } else if (status === "suspended") {
    services = services.filter(
      (s: any) => (s.provider as any)?.isActive === IsActive.BLOCKED
    );
  }

  // ── Search filter ─────────────────────────────────────────────────
  if (search) {
    const regex = new RegExp(search, "i");
    services = services.filter(
      (s: any) =>
        regex.test(s.service_name || "") ||
        regex.test((s.provider as any)?.name || "") ||
        regex.test((s.provider as any)?.email || "")
    );
  }

  // ── Count tabs (always from full unfiltered set) ──────────────────
  const allServices = await Service.find()
    .populate("provider", "isActive")
    .populate("activePlan", "name")
    .lean();

  const counts = {
    all: allServices.length,
    pending: allServices.filter((s: any) => s.subscriptionStatus === "inactive").length,
    paid: allServices.filter(
      (s: any) =>
        s.subscriptionStatus === "active" &&
        s.activePlan?.name &&
        s.activePlan.name !== "free"
    ).length,
    onFreeTrial: allServices.filter(
      (s: any) =>
        s.subscriptionStatus === "active" &&
        (!s.activePlan || s.activePlan?.name === "free")
    ).length,
    suspended: allServices.filter(
      (s: any) => (s.provider as any)?.isActive === IsActive.BLOCKED
    ).length,
  };

  // ── Pagination ────────────────────────────────────────────────────
  const total = services.length;
  const paginated = services.slice(skip, skip + limit);

  // ── Enrich with analytics counts ─────────────────────────────────
  const serviceIds = paginated.map((s: any) => s._id);

  const [impressionCounts, viewCounts] = await Promise.all([
    ServiceAnalytics.aggregate([
      { $match: { service: { $in: serviceIds }, type: "impression" } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
    ]),
    ServiceAnalytics.aggregate([
      { $match: { service: { $in: serviceIds }, type: "view" } },
      { $group: { _id: "$service", count: { $sum: 1 } } },
    ]),
  ]);

  const impressionMap = new Map(impressionCounts.map((r) => [r._id.toString(), r.count]));
  const viewMap = new Map(viewCounts.map((r) => [r._id.toString(), r.count]));

  const data = paginated.map((s: any) => ({
    _id: s._id.toString(),
    provider: {
      _id: s.provider?._id?.toString() || "",
      name: s.provider?.name || "",
      email: s.provider?.email || "",
      picture: s.provider?.picture,
      isActive: s.provider?.isActive || IsActive.ACTIVE,
    },
    service_name: s.service_name || "",
    service_category: s.service_category
      ? { _id: s.service_category._id?.toString(), name: s.service_category.name }
      : null,
    service_address: s.service_address || "",
    subscriptionStatus: s.subscriptionStatus || "inactive",
    activePlan: s.activePlan
      ? { _id: s.activePlan._id?.toString(), name: s.activePlan.name, title: s.activePlan.title }
      : null,
    subscriptionExpiresAt: s.subscriptionExpiresAt || null,
    impressions: impressionMap.get(s._id.toString()) || 0,
    views: viewMap.get(s._id.toString()) || 0,
    averageRating: s.averageRating || 0,
  }));

  return {
    data,
    meta: buildPaginationMeta(total, page, limit),
    counts,
  };
};

/* ================================================================== */
/*  3. SUSPEND / WITHDRAW SERVICE PROVIDER                             */
/* ================================================================== */

/**
 * Suspend: sets provider user isActive = BLOCKED, service subscriptionStatus = "inactive"
 * Withdraw: hard-deletes the service AND the provider user account
 */
const suspendServiceProvider = async (serviceId: string): Promise<void> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  if (!service.provider) {
    throw new AppError(httpStatus.BAD_REQUEST, "Service has no provider");
  }

  await Promise.all([
    User.findByIdAndUpdate(service.provider, { isActive: IsActive.BLOCKED }),
    Service.findByIdAndUpdate(serviceId, { subscriptionStatus: "inactive" }),
  ]);
};

const unsuspendServiceProvider = async (serviceId: string): Promise<void> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  if (!service.provider) {
    throw new AppError(httpStatus.BAD_REQUEST, "Service has no provider");
  }

  await Promise.all([
    User.findByIdAndUpdate(service.provider, { isActive: IsActive.ACTIVE }),
    Service.findByIdAndUpdate(serviceId, { subscriptionStatus: "active" }),
  ]);
};

const withdrawServiceProvider = async (serviceId: string): Promise<void> => {
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  const providerId = service.provider;

  // Delete service + mark user as deleted
  await Promise.all([
    Service.findByIdAndDelete(serviceId),
    providerId
      ? User.findByIdAndUpdate(providerId, {
          isDeleted: true,
          hasService: false,
          isActive: IsActive.INACTIVE,
        })
      : Promise.resolve(),
  ]);
};

/* ================================================================== */
/*  4. USERS LIST                                                       */
/* ================================================================== */

/**
 * Returns paginated list of regular users (role = USER).
 * Filters: all | active | blocked
 * No reviews column — just name, email, location, joined date, status
 */
const getUsers = async (
  status: UserFilterStatus = "all",
  page = 1,
  limit = 10,
  search = ""
): Promise<IUserListResponse> => {
  const skip = (page - 1) * limit;

  const baseFilter: any = { role: Role.USER, isDeleted: false };

  if (status === "active") {
    baseFilter.isActive = IsActive.ACTIVE;
  } else if (status === "blocked") {
    baseFilter.isActive = IsActive.BLOCKED;
  }

  if (search) {
    baseFilter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total, activeCount, blockedCount] = await Promise.all([
    User.find(baseFilter)
      .select("name email picture isActive coord createdAt")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(baseFilter),
    User.countDocuments({ role: Role.USER, isDeleted: false, isActive: IsActive.ACTIVE }),
    User.countDocuments({ role: Role.USER, isDeleted: false, isActive: IsActive.BLOCKED }),
  ]);

  const totalAll = await User.countDocuments({ role: Role.USER, isDeleted: false });

  const data = users.map((u: any) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    picture: u.picture,
    location: u.coord ? `${u.coord.lat}, ${u.coord.lon}` : undefined,
    isActive: u.isActive || IsActive.ACTIVE,
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
};

/* ================================================================== */
/*  5. BLOCK / UNBLOCK USER                                             */
/* ================================================================== */

const blockUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.role !== Role.USER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Can only block regular users");
  }
  await User.findByIdAndUpdate(userId, { isActive: IsActive.BLOCKED });
};

const unblockUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  await User.findByIdAndUpdate(userId, { isActive: IsActive.ACTIVE });
};

const deleteUser = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete super admin users");
  }
  await User.findByIdAndDelete(userId);
};

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
const getRevenueData = async (
  page = 1,
  limit = 10
): Promise<IRevenueResponse> => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentYear = now.getFullYear();

  // ── Revenue Stats ─────────────────────────────────────────────────
  const [lifetimeAgg, monthAgg, todayAgg] = await Promise.all([
    PaymentModel.aggregate([
      { $match: { payment_status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PaymentModel.aggregate([
      { $match: { payment_status: "PAID", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    PaymentModel.aggregate([
      { $match: { payment_status: "PAID", createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const stats = {
    lifetimeRevenue: lifetimeAgg[0]?.total || 0,
    thisMonthRevenue: monthAgg[0]?.total || 0,
    todayRevenue: todayAgg[0]?.total || 0,
  };

  // ── Monthly Revenue (current year) ───────────────────────────────
  const monthlyRaw = await PaymentModel.aggregate([
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

  const monthlyMap = new Map(monthlyRaw.map((r) => [r._id as number, r.revenue]));
  const monthlyRevenue = MONTHS.map((month, idx) => ({
    month,
    revenue: monthlyMap.get(idx + 1) || 0,
  }));

  // ── Daily Registrations (last 7 days) ────────────────────────────
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRaw = await User.aggregate([
    {
      $match: {
        role: { $ne: Role.SUPER_ADMIN },
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

  const dailyMap = new Map(dailyRaw.map((r) => [r._id as number, r.count]));

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
  const [payments, totalPayments] = await Promise.all([
    PaymentModel.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PaymentModel.countDocuments(),
  ]);

  const paymentLogData = payments.map((p: any) => ({
    _id: p._id.toString(),
    transaction_id: p.transaction_id,
    provider: {
      _id: p.user?._id?.toString() || "",
      name: p.user?.name || "Unknown",
      email: p.user?.email || "",
    },
    amount: p.amount,
    currency: p.currency || "GBP",
    payment_status: p.payment_status,
    createdAt: p.createdAt,
    payment_intent_id: p.payment_intent_id,
  }));

  return {
    stats,
    monthlyRevenue,
    dailyRegistrations,
    paymentLog: {
      data: paymentLogData,
      meta: buildPaginationMeta(totalPayments, page, limit),
    },
  };
};

/* ================================================================== */
/*  EXPORTS                                                             */
/* ================================================================== */
export const SuperAdminService = {
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