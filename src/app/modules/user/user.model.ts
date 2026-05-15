import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    picture: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: false },
    hasService: { type: Boolean, default: false },
    otp: { type: String, default: 0 },
    auths: [authProviderSchema],
    service: 
        {
            type: Schema.Types.ObjectId,
            ref: "Service",
        },
    fcmToken: { type: String },
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
            enum: ["none", "basic", "detailed"],
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
})

userSchema.index({ location: "2dsphere" });

export const User = model<IUser>("User", userSchema);