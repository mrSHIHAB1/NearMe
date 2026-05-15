/* eslint-disable @typescript-eslint/no-explicit-any */

import { User } from "../../modules/user/user.model";
import { getEffectivePlan } from "./getEffectivePlan";


export const syncUserSubscriptionInfo = async (userId: string) => {
  const plan: any = await getEffectivePlan(userId);

  await User.findByIdAndUpdate(userId, {
    $set: {
      subscriptionInfo: {
        planName: plan.name,
        badgeType: plan.features.badgeType,
        priorityScore: plan.features.priorityScore,
        isFeatured: plan.features.isHomepageFeaturedEligible,
        analyticsType: plan.features.analyticsType,
        hasHighlightedProfileBorder:
          plan.features.hasHighlightedProfileBorder,
      },
    },
  });
};
