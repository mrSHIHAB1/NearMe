
import { StatusCodes } from "http-status-codes";
import {
  decodeNotificationPayload,
  decodeRenewalInfo,
  decodeTransaction,
} from "app-store-server-api";
import { Request } from "express";
import { google } from "googleapis";
import AppError from "../../errorHelpers/AppError";
import PaymentTransaction from "./payment.model";
import {
  PaymentPlatform,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from "./payment.interface";
import { Subscription } from "../subscription/subscription.model";
import { Plan } from "../plan/plan.model";
import { TPlanName } from "../plan/plan.interface";
import { syncUserSubscriptionInfo } from "../../utils/subscriptionHelper/syncUserSubscriptionInfo";

type PurchaseSource = "apple" | "google";
type IapPlatform = "APPLE_IAP" | "GOOGLE_PLAY";

const PRODUCT_PLAN_MAP: Record<string, string> = (() => {
  const raw = process.env.IAP_PRODUCT_PLAN_MAP;
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch (error) {
    console.error("Invalid IAP_PRODUCT_PLAN_MAP JSON", error);
    return {};
  }
})();

const VALID_PLAN_NAMES: ReadonlySet<TPlanName> = new Set([
  "free",
  "basic",
  "pro",
  "elite",
]);

const getPlanNameForProduct = (productId: string): TPlanName => {
  const planName = PRODUCT_PLAN_MAP[productId] as TPlanName | undefined;
  if (!planName) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `No plan mapping for productId: ${productId}`
    );
  }

  if (!VALID_PLAN_NAMES.has(planName)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Invalid plan name mapping for productId: ${productId}`
    );
  }

  return planName;
};

const getPlanByName = async (planName: TPlanName) => {
  const plan = await Plan.findOne({ name: planName, isActive: true });
  if (!plan) {
    throw new AppError(StatusCodes.NOT_FOUND, "Plan not found");
  }

  return plan;
};

const markOtherSubscriptionsNotCurrent = async (userId: string, keepId?: string) => {
  const filter: Record<string, any> = { user: userId, isCurrent: true };
  if (keepId) {
    filter._id = { $ne: keepId };
  }

  await Subscription.updateMany(filter, {
    $set: { isCurrent: false, status: "cancelled" },
  });
};

const upsertSubscription = async (params: {
  userId: string;
  planId: string;
  productId: string;
  platform: IapPlatform;
  transactionId: string;
  originalTransactionId?: string;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  amount: number;
  currency: string;
}) => {
  const {
    userId,
    planId,
    productId,
    platform,
    transactionId,
    originalTransactionId,
    startDate,
    endDate,
    autoRenew,
    amount,
    currency,
  } = params;

  const lookup: Record<string, any> = { user: userId };
  if (originalTransactionId) {
    lookup.originalTransactionId = originalTransactionId;
  } else {
    lookup.transactionId = transactionId;
  }

  let subscription = await Subscription.findOne(lookup);

  if (subscription) {
    subscription.plan = planId as any;
    subscription.productId = productId;
    subscription.platform = platform;
    subscription.transactionId = transactionId;
    subscription.originalTransactionId = originalTransactionId;
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    subscription.autoRenew = autoRenew;
    subscription.amount = amount;
    subscription.currency = currency;
    subscription.status = endDate > new Date() ? "active" : "expired";
    subscription.isCurrent = true;
    subscription.paymentMethod = "iap";
    subscription.paymentGateway = platform;
    await subscription.save();

    await markOtherSubscriptionsNotCurrent(userId, subscription._id.toString());
    return subscription;
  }

  subscription = await Subscription.create({
    user: userId,
    plan: planId,
    status: endDate > new Date() ? "active" : "expired",
    startDate,
    endDate,
    autoRenew,
    amount,
    currency,
    paymentMethod: "iap",
    paymentGateway: platform,
    transactionId,
    originalTransactionId,
    productId,
    platform,
    isCurrent: true,
  });

  await markOtherSubscriptionsNotCurrent(userId, subscription._id.toString());

  return subscription;
};

const logPaymentTransaction = async (params: {
  userId: string;
  subscriptionId: string;
  transactionId: string;
  originalTransactionId?: string;
  transactionType: PaymentTransactionType;
  status: PaymentTransactionStatus;
  platform: PaymentPlatform;
  productId: string;
  amount: number;
  currency: string;
  planType?: string;
  billingCycle?: "1m" | "3m" | "1y";
  purchaseDate: Date;
  expiryDate?: Date;
  orderRef?: string;
  webhookEventType?: string;
  webhookPayload?: Record<string, any>;
  metadata?: Record<string, any>;
}) => {
  const { transactionId } = params;
  await PaymentTransaction.findOneAndUpdate(
    { transactionId },
    { $set: params },
    { upsert: true, new: true }
  );
};

const buildGoogleAuth = () => {
  const rawJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    const credentials = JSON.parse(rawJson);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });
  }

  const clientEmail = process.env.CLIENT_EMAIL;
  const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Missing Google Play service account credentials"
    );
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
      project_id: projectId,
      type: process.env.TYPE || "service_account",
    },
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
};

const getGooglePlayClient = () => {
  const auth = buildGoogleAuth();
  return google.androidpublisher({ version: "v3", auth });
};

const getGoogleSubscription = async (params: {
  packageName: string;
  subscriptionId: string;
  purchaseToken: string;
}) => {
  const client = getGooglePlayClient();

  const response = await client.purchases.subscriptions.get({
    packageName: params.packageName,
    subscriptionId: params.subscriptionId,
    token: params.purchaseToken,
  });

  return response.data;
};

const verifyApplePurchase = async (payload: {
  userId: string;
  receiptData: string;
  productId: string;
}) => {
  const { userId, receiptData, productId } = payload;

  const planName = getPlanNameForProduct(productId);
  const plan = await getPlanByName(planName);

  let transaction;
  try {
    transaction = await decodeTransaction(receiptData);
  } catch (error: any) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Failed to decode Apple transaction: ${error.message}`
    );
  }

  if (transaction.productId !== productId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Product mismatch: expected ${productId}, got ${transaction.productId}`
    );
  }

  const transactionId = transaction.transactionId;
  const originalTransactionId =
    transaction.originalTransactionId || transactionId;
  const purchaseDate = transaction.purchaseDate
    ? new Date(transaction.purchaseDate)
    : new Date();
  const expiryDate = transaction.expiresDate
    ? new Date(transaction.expiresDate)
    : null;

  if (!expiryDate) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Apple transaction missing expiry date"
    );
  }

  const subscription = await upsertSubscription({
    userId,
    planId: plan._id.toString(),
    productId: transaction.productId,
    platform: "APPLE_IAP",
    transactionId,
    originalTransactionId,
    startDate: purchaseDate,
    endDate: expiryDate,
    autoRenew: transaction.type === "Auto-Renewable Subscription",
    amount: plan.price,
    currency: plan.currency,
  });

  await logPaymentTransaction({
    userId,
    subscriptionId: subscription._id.toString(),
    transactionId,
    originalTransactionId,
    transactionType: PaymentTransactionType.PURCHASE,
    status: PaymentTransactionStatus.COMPLETED,
    platform: PaymentPlatform.APPLE_IAP,
    productId: transaction.productId,
    amount: plan.price,
    currency: plan.currency,
    planType: plan.name,
    billingCycle: "1m",
    purchaseDate,
    expiryDate,
    metadata: { rawTransaction: transaction },
  });

  await syncUserSubscriptionInfo(userId);

  return subscription;
};

const verifyGooglePurchase = async (payload: {
  userId: string;
  productId: string;
  purchaseToken: string;
  packageName: string;
  subscriptionId: string;
}) => {
  const { userId, productId, purchaseToken, packageName, subscriptionId } =
    payload;

  if (productId !== subscriptionId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "productId must match subscriptionId for Google Play"
    );
  }

  const planName = getPlanNameForProduct(productId);
  const plan = await getPlanByName(planName);

  const purchase = await getGoogleSubscription({
    packageName,
    subscriptionId,
    purchaseToken,
  });

  const expiryDate = purchase.expiryTimeMillis
    ? new Date(Number(purchase.expiryTimeMillis))
    : null;
  const startDate = purchase.startTimeMillis
    ? new Date(Number(purchase.startTimeMillis))
    : new Date();

  if (!expiryDate) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Google Play subscription missing expiryTimeMillis"
    );
  }

  const subscription = await upsertSubscription({
    userId,
    planId: plan._id.toString(),
    productId,
    platform: "GOOGLE_PLAY",
    transactionId: purchaseToken,
    originalTransactionId: purchase.linkedPurchaseToken || undefined,
    startDate,
    endDate: expiryDate,
    autoRenew: Boolean(purchase.autoRenewing),
    amount: plan.price,
    currency: plan.currency,
  });

  await logPaymentTransaction({
    userId,
    subscriptionId: subscription._id.toString(),
    transactionId: purchaseToken,
    originalTransactionId: purchase.linkedPurchaseToken || undefined,
    transactionType: PaymentTransactionType.PURCHASE,
    status: PaymentTransactionStatus.COMPLETED,
    platform: PaymentPlatform.GOOGLE_PLAY,
    productId,
    amount: plan.price,
    currency: plan.currency,
    planType: plan.name,
    billingCycle: "1m",
    purchaseDate: startDate,
    expiryDate,
    orderRef: purchase.orderId || undefined,
    metadata: { rawPurchase: purchase },
  });

  await syncUserSubscriptionInfo(userId);

  return subscription;
};

const verifyPurchase = async (payload: {
  userId: string;
  receiptData?: string;
  productId: string;
  source: PurchaseSource;
  purchaseToken?: string;
  packageName?: string;
  subscriptionId?: string;
}) => {
  if (payload.source === "apple") {
    if (!payload.receiptData) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "receiptData is required for Apple verification"
      );
    }

    return verifyApplePurchase({
      userId: payload.userId,
      receiptData: payload.receiptData,
      productId: payload.productId,
    });
  }

  if (!payload.purchaseToken || !payload.packageName || !payload.subscriptionId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "purchaseToken, packageName, and subscriptionId are required for Google verification"
    );
  }

  return verifyGooglePurchase({
    userId: payload.userId,
    productId: payload.productId,
    purchaseToken: payload.purchaseToken,
    packageName: payload.packageName,
    subscriptionId: payload.subscriptionId,
  });
};

const handleAppleWebhook = async (req: Request) => {
  const signedPayload = req.body.signedPayload;
  if (!signedPayload) {
    throw new Error("No signedPayload received");
  }

  const payload = await decodeNotificationPayload(signedPayload);
  const notificationUUID = payload.notificationUUID;
  const eventType = payload.notificationType as string;

  const alreadyProcessed = await PaymentTransaction.findOne({
    "webhookPayload.notificationUUID": notificationUUID,
  });

  if (alreadyProcessed) {
    return { message: "Duplicate event ignored" };
  }

  if (!payload.data?.signedTransactionInfo) {
    throw new Error("Missing transaction info");
  }

  const transaction = await decodeTransaction(
    payload.data.signedTransactionInfo
  );

  const transactionId = transaction.transactionId;
  const originalTransactionId =
    transaction.originalTransactionId || transactionId;

  const subscription = await Subscription.findOne({ originalTransactionId });
  if (!subscription) {
    return { message: "Subscription not found for webhook" };
  }

  let autoRenew = subscription.autoRenew;
  if (payload.data?.signedRenewalInfo) {
    try {
      const renewalInfo = await decodeRenewalInfo(
        payload.data.signedRenewalInfo
      );
      autoRenew = renewalInfo.autoRenewStatus === 1;
    } catch (error) {
      console.error("Renewal decode failed", error);
    }
  }

  const updateData: Record<string, any> = {
    autoRenew,
    transactionId,
    productId: transaction.productId,
  };

  if (transaction.expiresDate) {
    updateData.endDate = new Date(transaction.expiresDate);
  }

  switch (eventType) {
    case "DID_RENEW":
    case "DID_RECOVER":
    case "SUBSCRIBED":
      updateData.status = "active";
      break;
    case "EXPIRED":
    case "GRACE_PERIOD_EXPIRED":
      updateData.status = "expired";
      break;
    case "DID_FAIL_TO_RENEW":
      updateData.status = "payment_failed";
      break;
    case "REFUND":
      updateData.status = "cancelled";
      break;
    case "DID_CHANGE_RENEWAL_STATUS":
    case "DID_CHANGE_RENEWAL_PREF":
      break;
    default:
      return { message: "Ignored event" };
  }

  const updated = await Subscription.findOneAndUpdate(
    { originalTransactionId },
    { $set: updateData },
    { new: true }
  );

  if (!updated) {
    return { message: "Subscription update failed" };
  }

  await logPaymentTransaction({
    userId: updated.user.toString(),
    subscriptionId: updated._id.toString(),
    transactionId,
    originalTransactionId,
    transactionType:
      eventType === "DID_RENEW"
        ? PaymentTransactionType.RENEWAL
        : PaymentTransactionType.PURCHASE,
    status:
      eventType === "REFUND"
        ? PaymentTransactionStatus.REFUNDED
        : PaymentTransactionStatus.COMPLETED,
    platform: PaymentPlatform.APPLE_IAP,
    productId: transaction.productId,
    amount: updated.amount,
    currency: updated.currency,
    planType: undefined,
    billingCycle: "1m",
    purchaseDate: transaction.purchaseDate
      ? new Date(transaction.purchaseDate)
      : new Date(),
    expiryDate: transaction.expiresDate
      ? new Date(transaction.expiresDate)
      : undefined,
    webhookEventType: eventType,
    webhookPayload: payload,
    metadata: { rawTransaction: transaction },
  });

  await syncUserSubscriptionInfo(updated.user.toString());

  return updated;
};

const handleGoogleWebhook = async (req: Request) => {
  const messageData = req.body?.message?.data;
  if (!messageData) {
    throw new Error("Missing Pub/Sub message data");
  }

  const decoded = Buffer.from(messageData, "base64").toString("utf8");
  const payload = JSON.parse(decoded);

  const notification = payload.subscriptionNotification;
  if (!notification) {
    throw new Error("Missing subscriptionNotification payload");
  }

  const packageName = payload.packageName;
  const subscriptionId = notification.subscriptionId;
  const purchaseToken = notification.purchaseToken;

  if (!packageName || !subscriptionId || !purchaseToken) {
    throw new Error("Invalid Google RTDN payload");
  }

  const purchase = await getGoogleSubscription({
    packageName,
    subscriptionId,
    purchaseToken,
  });

  const subscription = await Subscription.findOne({
    transactionId: purchaseToken,
  });

  if (!subscription) {
    return { message: "Subscription not found for webhook" };
  }

  const expiryDate = purchase.expiryTimeMillis
    ? new Date(Number(purchase.expiryTimeMillis))
    : subscription.endDate;

  const updateData: Record<string, any> = {
    endDate: expiryDate,
    autoRenew: Boolean(purchase.autoRenewing),
  };

  switch (notification.notificationType) {
    case 1:
    case 2:
    case 4:
    case 7:
      updateData.status = "active";
      break;
    case 3:
    case 12:
      updateData.status = "cancelled";
      break;
    case 5:
    case 6:
    case 10:
    case 11:
      updateData.status = "payment_failed";
      break;
    case 13:
      updateData.status = "expired";
      break;
    default:
      break;
  }

  const updated = await Subscription.findOneAndUpdate(
    { _id: subscription._id },
    { $set: updateData },
    { new: true }
  );

  if (!updated) {
    return { message: "Subscription update failed" };
  }

  await logPaymentTransaction({
    userId: updated.user.toString(),
    subscriptionId: updated._id.toString(),
    transactionId: purchaseToken,
    originalTransactionId: purchase.linkedPurchaseToken || undefined,
    transactionType: PaymentTransactionType.RENEWAL,
    status: PaymentTransactionStatus.COMPLETED,
    platform: PaymentPlatform.GOOGLE_PLAY,
    productId: subscriptionId,
    amount: updated.amount,
    currency: updated.currency,
    planType: undefined,
    billingCycle: "1m",
    purchaseDate: updated.startDate,
    expiryDate,
    orderRef: purchase.orderId || undefined,
    webhookEventType: String(notification.notificationType),
    webhookPayload: payload,
    metadata: { rawPurchase: purchase },
  });

  await syncUserSubscriptionInfo(updated.user.toString());

  return updated;
};

export const PaymentService = {
  verifyPurchase,
  handleAppleWebhook,
  handleGoogleWebhook,
};
