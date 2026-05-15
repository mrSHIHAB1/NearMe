import { Plan } from "../modules/plan/plan.model";

export const seedPlans = async () => {
  const plans = [
    {
      name: "free",
      title: "Free plan",
      slug: "free-plan",
      price: 0,
      currency: "GBP",
      interval: "monthly",
      features: {
        maxPhotos: 3,
        maxOfferServices: 1,
        badgeType: "none",
        analyticsType: "none",
        priorityScore: 0,
        canReplyToReviews: false,
        isHomepageFeaturedEligible: false,
        hasHighlightedProfileBorder: false,
      },
      isActive: true,
    },
    {
      name: "basic",
      title: "Basic plan",
      slug: "basic-plan",
      price: 9.99,
      currency: "GBP",
      interval: "monthly",
      features: {
        maxPhotos: 10,
        maxOfferServices: 3,
        badgeType: "active",
        analyticsType: "basic",
        priorityScore: 1,
        canReplyToReviews: false,
        isHomepageFeaturedEligible: false,
        hasHighlightedProfileBorder: false,
      },
      isActive: true,
    },
    {
      name: "pro",
      title: "Pro plan",
      slug: "pro-plan",
      price: 19.99,
      currency: "GBP",
      interval: "monthly",
      features: {
        maxPhotos: -1,
        maxOfferServices: -1,
        badgeType: "verified_pro",
        analyticsType: "detailed",
        priorityScore: 2,
        canReplyToReviews: true,
        isHomepageFeaturedEligible: false,
        hasHighlightedProfileBorder: false,
      },
      isActive: true,
    },
    {
      name: "elite",
      title: "Elite plan",
      slug: "elite-plan",
      price: 49.99,
      currency: "GBP",
      interval: "monthly",
      features: {
        maxPhotos: -1,
        maxOfferServices: -1,
        badgeType: "elite",
        analyticsType: "detailed",
        priorityScore: 3,
        canReplyToReviews: true,
        isHomepageFeaturedEligible: true,
        hasHighlightedProfileBorder: true,
      },
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await Plan.updateOne({ name: plan.name }, { $set: plan }, { upsert: true }
    );
  }
  console.log("Plans seeded successfully");
};