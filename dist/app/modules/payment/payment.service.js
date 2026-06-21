"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const http_status_codes_1 = require("http-status-codes");
const app_store_server_api_1 = require("app-store-server-api");
const googleapis_1 = require("googleapis");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const payment_model_1 = __importDefault(require("./payment.model"));
const payment_interface_1 = require("./payment.interface");
const subscription_model_1 = require("../subscription/subscription.model");
const plan_model_1 = require("../plan/plan.model");
const syncUserSubscriptionInfo_1 = require("../../utils/subscriptionHelper/syncUserSubscriptionInfo");
const PRODUCT_PLAN_MAP = (() => {
    const raw = process.env.IAP_PRODUCT_PLAN_MAP;
    if (!raw) {
        return {};
    }
    try {
        return JSON.parse(raw);
    }
    catch (error) {
        console.error("Invalid IAP_PRODUCT_PLAN_MAP JSON", error);
        return {};
    }
})();
const VALID_PLAN_NAMES = new Set([
    "free",
    "basic",
    "pro",
    "elite",
]);
const getPlanNameForProduct = (productId) => {
    const planName = PRODUCT_PLAN_MAP[productId];
    if (!planName) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `No plan mapping for productId: ${productId}`);
    }
    if (!VALID_PLAN_NAMES.has(planName)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Invalid plan name mapping for productId: ${productId}`);
    }
    return planName;
};
const getPlanByName = (planName) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield plan_model_1.Plan.findOne({ name: planName, isActive: true });
    if (!plan) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Plan not found");
    }
    return plan;
});
const markOtherSubscriptionsNotCurrent = (userId, keepId) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { user: userId, isCurrent: true };
    if (keepId) {
        filter._id = { $ne: keepId };
    }
    yield subscription_model_1.Subscription.updateMany(filter, {
        $set: { isCurrent: false, status: "cancelled" },
    });
});
const upsertSubscription = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, planId, productId, platform, transactionId, originalTransactionId, startDate, endDate, autoRenew, amount, currency, } = params;
    const lookup = { user: userId };
    if (originalTransactionId) {
        lookup.originalTransactionId = originalTransactionId;
    }
    else {
        lookup.transactionId = transactionId;
    }
    let subscription = yield subscription_model_1.Subscription.findOne(lookup);
    if (subscription) {
        subscription.plan = planId;
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
        yield subscription.save();
        yield markOtherSubscriptionsNotCurrent(userId, subscription._id.toString());
        return subscription;
    }
    subscription = yield subscription_model_1.Subscription.create({
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
    yield markOtherSubscriptionsNotCurrent(userId, subscription._id.toString());
    return subscription;
});
const logPaymentTransaction = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId } = params;
    yield payment_model_1.default.findOneAndUpdate({ transactionId }, { $set: params }, { upsert: true, new: true });
});
const buildGoogleAuth = () => {
    var _a;
    const rawJson = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (rawJson) {
        const credentials = JSON.parse(rawJson);
        return new googleapis_1.google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/androidpublisher"],
        });
    }
    const clientEmail = process.env.CLIENT_EMAIL;
    const privateKey = (_a = process.env.PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n");
    const projectId = process.env.PROJECT_ID;
    if (!clientEmail || !privateKey || !projectId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Missing Google Play service account credentials");
    }
    return new googleapis_1.google.auth.GoogleAuth({
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
    return googleapis_1.google.androidpublisher({ version: "v3", auth });
};
const getGoogleSubscription = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const client = getGooglePlayClient();
    const response = yield client.purchases.subscriptions.get({
        packageName: params.packageName,
        subscriptionId: params.subscriptionId,
        token: params.purchaseToken,
    });
    return response.data;
});
const verifyApplePurchase = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, receiptData, productId } = payload;
    const planName = getPlanNameForProduct(productId);
    const plan = yield getPlanByName(planName);
    let transaction;
    try {
        transaction = yield (0, app_store_server_api_1.decodeTransaction)(receiptData);
    }
    catch (error) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Failed to decode Apple transaction: ${error.message}`);
    }
    if (transaction.productId !== productId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Product mismatch: expected ${productId}, got ${transaction.productId}`);
    }
    const transactionId = transaction.transactionId;
    const originalTransactionId = transaction.originalTransactionId || transactionId;
    const purchaseDate = transaction.purchaseDate
        ? new Date(transaction.purchaseDate)
        : new Date();
    const expiryDate = transaction.expiresDate
        ? new Date(transaction.expiresDate)
        : null;
    if (!expiryDate) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Apple transaction missing expiry date");
    }
    const subscription = yield upsertSubscription({
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
    yield logPaymentTransaction({
        userId,
        subscriptionId: subscription._id.toString(),
        transactionId,
        originalTransactionId,
        transactionType: payment_interface_1.PaymentTransactionType.PURCHASE,
        status: payment_interface_1.PaymentTransactionStatus.COMPLETED,
        platform: payment_interface_1.PaymentPlatform.APPLE_IAP,
        productId: transaction.productId,
        amount: plan.price,
        currency: plan.currency,
        planType: plan.name,
        billingCycle: "1m",
        purchaseDate,
        expiryDate,
        metadata: { rawTransaction: transaction },
    });
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
    return subscription;
});
const verifyGooglePurchase = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId, purchaseToken, packageName, subscriptionId } = payload;
    if (productId !== subscriptionId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "productId must match subscriptionId for Google Play");
    }
    const planName = getPlanNameForProduct(productId);
    const plan = yield getPlanByName(planName);
    const purchase = yield getGoogleSubscription({
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
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Google Play subscription missing expiryTimeMillis");
    }
    const subscription = yield upsertSubscription({
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
    yield logPaymentTransaction({
        userId,
        subscriptionId: subscription._id.toString(),
        transactionId: purchaseToken,
        originalTransactionId: purchase.linkedPurchaseToken || undefined,
        transactionType: payment_interface_1.PaymentTransactionType.PURCHASE,
        status: payment_interface_1.PaymentTransactionStatus.COMPLETED,
        platform: payment_interface_1.PaymentPlatform.GOOGLE_PLAY,
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
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(userId);
    return subscription;
});
const verifyPurchase = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.source === "apple") {
        if (!payload.receiptData) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "receiptData is required for Apple verification");
        }
        return verifyApplePurchase({
            userId: payload.userId,
            receiptData: payload.receiptData,
            productId: payload.productId,
        });
    }
    if (!payload.purchaseToken || !payload.packageName || !payload.subscriptionId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "purchaseToken, packageName, and subscriptionId are required for Google verification");
    }
    return verifyGooglePurchase({
        userId: payload.userId,
        productId: payload.productId,
        purchaseToken: payload.purchaseToken,
        packageName: payload.packageName,
        subscriptionId: payload.subscriptionId,
    });
});
const handleAppleWebhook = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const signedPayload = req.body.signedPayload;
    if (!signedPayload) {
        throw new Error("No signedPayload received");
    }
    const payload = yield (0, app_store_server_api_1.decodeNotificationPayload)(signedPayload);
    const notificationUUID = payload.notificationUUID;
    const eventType = payload.notificationType;
    const alreadyProcessed = yield payment_model_1.default.findOne({
        "webhookPayload.notificationUUID": notificationUUID,
    });
    if (alreadyProcessed) {
        return { message: "Duplicate event ignored" };
    }
    if (!((_a = payload.data) === null || _a === void 0 ? void 0 : _a.signedTransactionInfo)) {
        throw new Error("Missing transaction info");
    }
    const transaction = yield (0, app_store_server_api_1.decodeTransaction)(payload.data.signedTransactionInfo);
    const transactionId = transaction.transactionId;
    const originalTransactionId = transaction.originalTransactionId || transactionId;
    const subscription = yield subscription_model_1.Subscription.findOne({ originalTransactionId });
    if (!subscription) {
        return { message: "Subscription not found for webhook" };
    }
    let autoRenew = subscription.autoRenew;
    if ((_b = payload.data) === null || _b === void 0 ? void 0 : _b.signedRenewalInfo) {
        try {
            const renewalInfo = yield (0, app_store_server_api_1.decodeRenewalInfo)(payload.data.signedRenewalInfo);
            autoRenew = renewalInfo.autoRenewStatus === 1;
        }
        catch (error) {
            console.error("Renewal decode failed", error);
        }
    }
    const updateData = {
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
    const updated = yield subscription_model_1.Subscription.findOneAndUpdate({ originalTransactionId }, { $set: updateData }, { new: true });
    if (!updated) {
        return { message: "Subscription update failed" };
    }
    yield logPaymentTransaction({
        userId: updated.user.toString(),
        subscriptionId: updated._id.toString(),
        transactionId,
        originalTransactionId,
        transactionType: eventType === "DID_RENEW"
            ? payment_interface_1.PaymentTransactionType.RENEWAL
            : payment_interface_1.PaymentTransactionType.PURCHASE,
        status: eventType === "REFUND"
            ? payment_interface_1.PaymentTransactionStatus.REFUNDED
            : payment_interface_1.PaymentTransactionStatus.COMPLETED,
        platform: payment_interface_1.PaymentPlatform.APPLE_IAP,
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
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(updated.user.toString());
    return updated;
});
const handleGoogleWebhook = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const messageData = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.data;
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
    const purchase = yield getGoogleSubscription({
        packageName,
        subscriptionId,
        purchaseToken,
    });
    const subscription = yield subscription_model_1.Subscription.findOne({
        transactionId: purchaseToken,
    });
    if (!subscription) {
        return { message: "Subscription not found for webhook" };
    }
    const expiryDate = purchase.expiryTimeMillis
        ? new Date(Number(purchase.expiryTimeMillis))
        : subscription.endDate;
    const updateData = {
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
    const updated = yield subscription_model_1.Subscription.findOneAndUpdate({ _id: subscription._id }, { $set: updateData }, { new: true });
    if (!updated) {
        return { message: "Subscription update failed" };
    }
    yield logPaymentTransaction({
        userId: updated.user.toString(),
        subscriptionId: updated._id.toString(),
        transactionId: purchaseToken,
        originalTransactionId: purchase.linkedPurchaseToken || undefined,
        transactionType: payment_interface_1.PaymentTransactionType.RENEWAL,
        status: payment_interface_1.PaymentTransactionStatus.COMPLETED,
        platform: payment_interface_1.PaymentPlatform.GOOGLE_PLAY,
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
    yield (0, syncUserSubscriptionInfo_1.syncUserSubscriptionInfo)(updated.user.toString());
    return updated;
});
exports.PaymentService = {
    verifyPurchase,
    handleAppleWebhook,
    handleGoogleWebhook,
};
