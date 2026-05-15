import { Types } from "mongoose";

export enum Role {
    USER = "USER",
    PROVIDER = "PROVIDER",
    SUPER_ADMIN = "SUPER_ADMIN"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IAuthProvider {
    provider: "google" | "credentials" | "apple";
    providerId: string;
}

export interface ICoord {
    lat: number;
    lon: number;
}

export interface ISubscriptionInfo {
    planName: "free" | "basic" | "pro" | "elite";
    badgeType: "none" | "active" | "verified_pro" | "elite";
    priorityScore: number;
    isFeatured: boolean;
    analyticsType: "none" | "basic" | "detailed";
    hasHighlightedProfileBorder: boolean;
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    password?: string;
    picture?: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    hasService?: boolean;
    otp?: string;
    role: Role;
    auths: IAuthProvider[];
    service?: Types.ObjectId;
    reviews?: Types.ObjectId[];
    messages?: Types.ObjectId[];
    createdAt?: Date;
    fcmToken?: string;
    coord?: ICoord;
    subscriptionInfo?: ISubscriptionInfo;
}