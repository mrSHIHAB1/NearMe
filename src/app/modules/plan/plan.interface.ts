export type TPlanName = "free" | "basic" | "pro" | "elite";
export type TBadgeType = "none" | "active" | "verified_pro" | "elite";
export type TAnalyticsType = "none" | "basic" | "detailed";

export interface TPlanFeatures {
  maxPhotos: number; // use -1 for unlimited
  maxOfferServices: number; // use -1 for unlimited
  badgeType: TBadgeType;
  analyticsType: TAnalyticsType;
  priorityScore: number; // bigger = higher ranking
  canReplyToReviews: boolean;
  isHomepageFeaturedEligible: boolean;
  hasHighlightedProfileBorder: boolean;
}

export interface TPlan {
  name: TPlanName;
  title: string;
  slug: string;
  price: number;
  currency: string;
  interval: "monthly";
  description?: string;
  features: TPlanFeatures;
  isActive: boolean;
}