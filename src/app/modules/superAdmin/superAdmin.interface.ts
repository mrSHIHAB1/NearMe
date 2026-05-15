export interface IProviderStatusBreakdown {
  paid: number;
  onFreeTrial: number;
}

export interface IPlatformGrowthPoint {
  month: string;
  providers: number;
  revenue: number;
}

export interface IDashboardStats {
  totalServiceProviders: number;
  totalUsers: number;
  onFreeTrial: number;
  totalRevenue: number;
  providerStatus: IProviderStatusBreakdown;
  platformGrowth: IPlatformGrowthPoint[];
}

// ── Service Providers ─────────────────────────────────────────────────────────

export type ProviderFilterStatus = "all" | "pending" | "paid" | "on_free_trial" | "suspended";

export interface IProviderListItem {
  _id: string;
  provider: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
    isActive: string;
  };
  service_name: string;
  service_category: {
    _id: string;
    name: string;
  } | null;
  service_address: string;
  subscriptionStatus: string;
  activePlan: {
    _id: string;
    name: string;
    title: string;
  } | null;
  subscriptionExpiresAt: Date | null;
  impressions: number;
  views: number;
  averageRating: number;
}

export interface IProviderListResponse {
  data: IProviderListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    all: number;
    pending: number;
    paid: number;
    onFreeTrial: number;
    suspended: number;
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserFilterStatus = "all" | "active" | "blocked";

export interface IUserListItem {
  _id: string;
  name: string;
  email: string;
  picture?: string;
  location?: string;
  isActive: string;
  createdAt: Date;
}

export interface IUserListResponse {
  data: IUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    total: number;
    active: number;
    blocked: number;
  };
}

// ── Revenue ───────────────────────────────────────────────────────────────────

export interface IRevenueStats {
  lifetimeRevenue: number;
  thisMonthRevenue: number;
  todayRevenue: number;
}

export interface IMonthlyRevenuePoint {
  month: string;
  revenue: number;
}

export interface IDailyRegistrationPoint {
  day: string;
  count: number;
}

export interface IPaymentLogItem {
  _id: string;
  transaction_id: string;
  provider: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  payment_status: string;
  createdAt: Date;
  payment_intent_id?: string;
}

export interface IRevenueResponse {
  stats: IRevenueStats;
  monthlyRevenue: IMonthlyRevenuePoint[];
  dailyRegistrations: IDailyRegistrationPoint[];
  paymentLog: {
    data: IPaymentLogItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}