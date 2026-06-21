"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = require("mongoose");
const locationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
    },
    coordinates: {
        type: [Number],
        required: true,
    },
    address: {
        type: String,
    },
});
const serviceSchema = new mongoose_1.Schema({
    provider: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // one service per provider
    },
    provider_name: { type: String, required: true },
    service_name: { type: String, required: true },
    service_category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    service_subCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    service_childCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    highlight_services: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "HighlightService",
        },
    ],
    offer_services: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
    ],
    phone: { type: String, required: true },
    service_address: { type: String, required: true },
    about: { type: String, required: true },
    website_link: { type: String, required: true },
    location: locationSchema,
    media: { type: [String], required: true, default: [] },
    company_logo: { type: String, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    allTimeAvailability: { type: Boolean, required: true },
    // ── Subscription ───────────────────────────────────────────────
    activePlan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Plan",
        default: null,
    },
    subscriptionStatus: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "inactive",
        index: true,
    },
    subscriptionExpiresAt: {
        type: Date,
        default: null, // null = free plan / not yet paid
    },
    // ── Rating ───────────────────────────────────────────────────────
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
}, { timestamps: true, versionKey: false });
serviceSchema.index({ location: "2dsphere" });
exports.Service = (0, mongoose_1.model)("Service", serviceSchema);
