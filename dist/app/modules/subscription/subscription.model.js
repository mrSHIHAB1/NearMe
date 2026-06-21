"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    plan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "cancelled", "pending", "payment_failed"],
        default: "pending",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    autoRenew: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    currency: { type: String, default: "GBP" },
    paymentMethod: { type: String },
    paymentGateway: { type: String },
    transactionId: { type: String },
    originalTransactionId: { type: String },
    productId: { type: String },
    platform: { type: String, enum: ["APPLE_IAP", "GOOGLE_PLAY"] },
    isCurrent: { type: Boolean, default: true },
}, { timestamps: true });
subscriptionSchema.index({ user: 1, isCurrent: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ originalTransactionId: 1 });
exports.Subscription = (0, mongoose_1.model)("Subscription", subscriptionSchema);
