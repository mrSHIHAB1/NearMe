"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const mongoose_1 = require("mongoose");
const planSchema = new mongoose_1.Schema({
    name: {
        type: String,
        enum: ["free", "basic", "pro", "elite"],
        required: true,
        unique: true,
    },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "GBP" },
    interval: { type: String, enum: ["monthly"], default: "monthly" },
    description: { type: String },
    features: {
        maxPhotos: { type: Number, required: true },
        maxOfferServices: { type: Number, required: true },
        badgeType: {
            type: String,
            enum: ["none", "active", "verified_pro", "elite"],
            default: "none",
        },
        analyticsType: {
            type: String,
            enum: ["none", "basic", "detailed", "advanced"],
            default: "none",
        },
        priorityScore: { type: Number, required: true, default: 0 },
        canReplyToReviews: { type: Boolean, default: false },
        isHomepageFeaturedEligible: { type: Boolean, default: false },
        hasHighlightedProfileBorder: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
exports.Plan = (0, mongoose_1.model)("Plan", planSchema);
