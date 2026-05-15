import { Subscription } from "../../modules/subscription/subscription.model";
import { syncUserSubscriptionInfo } from "./syncUserSubscriptionInfo";


export const expireSubscriptionsAndDowngradeUsers = async () => {
  const now = new Date();

  const expiredSubscriptions = await Subscription.find({
    status: "active",
    isCurrent: true,
    endDate: { $lt: now },
  });

  for (const subscription of expiredSubscriptions) {
    subscription.status = "expired";
    subscription.isCurrent = false;
    await subscription.save();

    await syncUserSubscriptionInfo(String(subscription.user));
  }
};