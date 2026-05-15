/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Plan } from "../plan/plan.model";
import { Subscription } from "./subscription.model";
import { getActiveSubscription } from "../../utils/subscriptionHelper/getActiveSubscription";
import { getEffectivePlan } from "../../utils/subscriptionHelper/getEffectivePlan";
import { syncUserSubscriptionInfo } from "../../utils/subscriptionHelper/syncUserSubscriptionInfo";

const getMyCurrentSubscription = async (userId: string) => {
  const activeSubscription = await getActiveSubscription(userId);

  if (activeSubscription) {
    return activeSubscription;
  }

  const freePlan: any = await getEffectivePlan(userId);

  return {
    isDefaultFreePlan: true,
    status: "active",
    plan: freePlan,
    startDate: null,
    endDate: null,
    autoRenew: false,
    amount: freePlan.price,
    currency: freePlan.currency,
  };
};

const getMySubscriptionHistory = async (userId: string) => {
  const result = await Subscription.find({ user: userId })
    .populate("plan")
    .sort({ createdAt: -1 });

  return result;
};

// temporary manual activation flow
// later this function can be replaced by payment success webhook logic
const subscribeToPlan = async (userId: string, planId: string) => {
  const plan: any = await Plan.findById(planId);

  if (!plan || !plan.isActive) {
    throw new AppError(httpStatus.NOT_FOUND, "Plan not found");
  }

  if (plan.name === "free") {
    await syncUserSubscriptionInfo(userId);

    return {
      message: "Free plan applied successfully",
      plan,
    };
  }

  const activeSubscription = await Subscription.findOne({
    user: userId,
    isCurrent: true,
  });

  if (activeSubscription) {
    activeSubscription.isCurrent = false;

    if (activeSubscription.status === "active") {
      activeSubscription.status = "cancelled";
    }

    await activeSubscription.save();
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const newSubscription = await Subscription.create({
    user: userId,
    plan: plan._id,
    status: "active",
    startDate,
    endDate,
    autoRenew: false,
    amount: plan.price,
    currency: plan.currency,
    paymentMethod: "manual",
    paymentGateway: "manual",
    transactionId: `manual_${Date.now()}`,
    isCurrent: true,
  });

  await syncUserSubscriptionInfo(userId);

  return await Subscription.findById(newSubscription._id).populate("plan");
};

const cancelMySubscription = async (userId: string) => {
  const activeSubscription = await Subscription.findOne({
    user: userId,
    status: "active",
    isCurrent: true,
  });

  if (!activeSubscription) {
    throw new AppError(httpStatus.NOT_FOUND, "No active subscription found");
  }

  activeSubscription.status = "cancelled";
  activeSubscription.isCurrent = false;
  await activeSubscription.save();

  await syncUserSubscriptionInfo(userId);

  return activeSubscription;
};

export const SubscriptionService = {
  getMyCurrentSubscription,
  getMySubscriptionHistory,
  subscribeToPlan,
  cancelMySubscription,
};