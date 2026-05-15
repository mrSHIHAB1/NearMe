import { Subscription } from "../../modules/subscription/subscription.model";


export const getActiveSubscription = async (userId: string) => {
  const now = new Date();

  const subscription = await Subscription.findOne({
    user: userId,
    status: "active",
    isCurrent: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).populate("plan");

  return subscription;
};
