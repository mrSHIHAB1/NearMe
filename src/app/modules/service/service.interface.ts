import { Types } from "mongoose";

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
}

export interface GetServicesByCategoryParams {
  categoryId: string;
  lon: string;
  lat: string;
  offerServiceIds?: string[];
  searchTerm?: string;
  minRating?: number;
  radius?: number;       // miles
  availability?: boolean; // true = open now only
  service_subCategory?: string;  // optional sub-category ID
  service_childCategory?: string | string[]; // optional child-category ID(s)
}

export type SubscriptionStatus = "active" | "inactive" | "expired";

export interface IService {
  id?: Types.ObjectId;
  provider?: Types.ObjectId;
  service_name?: string;
  service_category?: Types.ObjectId;
  service_subCategory?: Types.ObjectId;
  service_childCategory?: Types.ObjectId;
  highlight_services?: Types.ObjectId[];
  offer_services?: Types.ObjectId[];
  phone?: string;
  service_address?: string;
  about?: string;
  website_link?: string;
  location: ILocation;
  media?: string[];
  company_logo?: string;
  openingTime: string;
  closingTime: string;
  allTimeAvailability: boolean;

  // ── Subscription fields (set after payment) ──────────────────────
  activePlan?: Types.ObjectId;            // ref → Plan
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: Date | null;    // null = free plan (never expires)

  // ── Rating ───────────────────────────────────────────────────────
  averageRating?: number;                 // avg rating from reviews (0-5)
}