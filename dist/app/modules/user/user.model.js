"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authProviderSchema = new mongoose_1.Schema({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.USER
    },
    picture: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    hasService: { type: Boolean, default: false },
    otp: { type: String, default: 0 },
    auths: [authProviderSchema],
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
    },
    fcmToken: [{ type: String }],
    coord: {
        type: { lat: { type: Number }, lon: { type: Number } },
        _id: false,
    },
    subscriptionInfo: {
        planName: {
            type: String,
            enum: ["free", "basic", "pro", "elite"],
            default: "free",
        },
        badgeType: {
            type: String,
            enum: ["none", "active", "verified_pro", "elite"],
            default: "none",
        },
        priorityScore: {
            type: Number,
            default: 0,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        analyticsType: {
            type: String,
            enum: ["none", "basic", "detailed", "advanced"],
            default: "none",
        },
        hasHighlightedProfileBorder: {
            type: Boolean,
            default: false,
        },
    },
}, {
    timestamps: true,
    versionKey: false
});
userSchema.index({ location: "2dsphere" });
exports.User = (0, mongoose_1.model)("User", userSchema);
