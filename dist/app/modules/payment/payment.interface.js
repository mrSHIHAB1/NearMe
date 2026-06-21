"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPlatform = exports.PaymentTransactionStatus = exports.PaymentTransactionType = void 0;
// ============ Payment Transaction Types ============
var PaymentTransactionType;
(function (PaymentTransactionType) {
    PaymentTransactionType["PURCHASE"] = "PURCHASE";
    PaymentTransactionType["RENEWAL"] = "RENEWAL";
    PaymentTransactionType["REFUND"] = "REFUND";
    PaymentTransactionType["CANCELLATION"] = "CANCELLATION";
    PaymentTransactionType["REACTIVATION"] = "REACTIVATION";
    PaymentTransactionType["PLAN_UPGRADE"] = "PLAN_UPGRADE";
    PaymentTransactionType["PLAN_DOWNGRADE"] = "PLAN_DOWNGRADE";
    PaymentTransactionType["FAILED"] = "FAILED";
})(PaymentTransactionType || (exports.PaymentTransactionType = PaymentTransactionType = {}));
var PaymentTransactionStatus;
(function (PaymentTransactionStatus) {
    PaymentTransactionStatus["PENDING"] = "PENDING";
    PaymentTransactionStatus["COMPLETED"] = "COMPLETED";
    PaymentTransactionStatus["FAILED"] = "FAILED";
    PaymentTransactionStatus["CANCELLED"] = "CANCELLED";
    PaymentTransactionStatus["REFUNDED"] = "REFUNDED";
})(PaymentTransactionStatus || (exports.PaymentTransactionStatus = PaymentTransactionStatus = {}));
var PaymentPlatform;
(function (PaymentPlatform) {
    PaymentPlatform["APPLE_IAP"] = "APPLE_IAP";
    PaymentPlatform["GOOGLE_PLAY"] = "GOOGLE_PLAY";
    PaymentPlatform["WEB"] = "WEB";
    PaymentPlatform["STRIPE"] = "STRIPE";
})(PaymentPlatform || (exports.PaymentPlatform = PaymentPlatform = {}));
