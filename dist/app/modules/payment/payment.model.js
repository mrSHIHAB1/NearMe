"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const payment_interface_1 = require("./payment.interface");
const paymentTransactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    subscriptionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Subscription",
        sparse: true,
    },
    // Transaction Identifiers
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    originalTransactionId: {
        type: String,
        sparse: true,
        index: true,
    },
    orderRef: {
        type: String,
        sparse: true,
    },
    // Transaction Details
    transactionType: {
        type: String,
        enum: Object.values(payment_interface_1.PaymentTransactionType),
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(payment_interface_1.PaymentTransactionStatus),
        default: payment_interface_1.PaymentTransactionStatus.PENDING,
        index: true,
    },
    // Payment Info
    platform: {
        type: String,
        enum: Object.values(payment_interface_1.PaymentPlatform),
        required: true,
        index: true,
    },
    productId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: "USD",
        uppercase: true,
    },
    // Plan Info
    planType: {
        type: String,
        sparse: true,
    },
    billingCycle: {
        type: String,
        enum: ["1m", "3m", "1y"],
        sparse: true,
    },
    // Dates
    purchaseDate: {
        type: Date,
        required: true,
        index: true,
    },
    expiryDate: {
        type: Date,
        sparse: true,
    },
    refundDate: {
        type: Date,
        sparse: true,
    },
    // Webhook/Event Info
    webhookEventType: {
        type: String,
        sparse: true,
    },
    webhookPayload: {
        type: mongoose_1.Schema.Types.Mixed,
        sparse: true,
    },
    // Error Handling
    errorMessage: {
        type: String,
        sparse: true,
    },
    retryCount: {
        type: Number,
        default: 0,
    },
    // Metadata
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        sparse: true,
    },
}, { timestamps: true });
// Compound indices for common queries
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ userId: 1, transactionType: 1 });
paymentTransactionSchema.index({ userId: 1, status: 1 });
paymentTransactionSchema.index({ userId: 1, platform: 1 });
paymentTransactionSchema.index({ transactionId: 1, platform: 1 });
const PaymentTransaction = (0, mongoose_1.model)("PaymentTransaction", paymentTransactionSchema);
exports.default = PaymentTransaction;
