"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariables = () => {
    const requiredEnvVariables = [
        "PORT",
        "DB_URL",
        "NODE_ENV",
        "BCRYPT_SALT_ROUND",
        "JWT_ACCESS_EXPIRES",
        "JWT_ACCESS_SECRET",
        "OTP_JWT_ACCESS_SECRET",
        "OTP_JWT_ACCESS_EXPIRATION",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRES",
        "SUPER_ADMIN_EMAIL",
        "SUPER_ADMIN_PASSWORD",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CALLBACK_URL",
        "GOOGLE_ANDROID_CLIENT_ID",
        "GOOGLE_IOS_CLIENT_ID",
        "EXPRESS_SESSION_SECRET",
        "FRONTEND_URL",
        "SSL_STORE_ID",
        "SSL_STORE_PASS",
        "SSL_PAYMENT_API", "SSL_VALIDATION_API", "SSL_SUCCESS_FRONTEND_URL",
        "SSL_FAIL_FRONTEND_URL",
        "SSL_CANCEL_FRONTEND_URL",
        "SSL_SUCCESS_BACKEND_URL",
        "SSL_FAIL_BACKEND_URL",
        "SSL_CANCEL_BACKEND_URL",
        "SSL_IPN_URL",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "SMTP_PASS",
        "SMTP_PORT",
        "SMTP_HOST",
        "SMTP_USER",
        "SMTP_FROM",
        "REDIS_HOST",
        "REDIS_PORT",
        "REDIS_USERNAME",
        "REDIS_PASSWORD",
        'TYPE',
        'PROJECT_ID',
        'PRIVATE_KEY_ID',
        'PRIVATE_KEY',
        'CLIENT_EMAIL',
        'CLIENT_ID',
        'AUTH_URI',
        'TOKEN_URI',
        'AUTH_PROVIDER_X509_CERT_URL',
        'CLIENT_X509_CERT_URL',
        'UNIVERSE_DOMAIN',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];
    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    });
    return {
        PORT: process.env.PORT,
        DB_URL: process.env.DB_URL,
        NODE_ENV: process.env.NODE_ENV,
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND,
        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
        OTP_JWT_ACCESS_SECRET: process.env.OTP_JWT_ACCESS_SECRET,
        OTP_JWT_ACCESS_EXPIRATION: process.env.OTP_JWT_ACCESS_EXPIRATION,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
        GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,
        GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
        FRONTEND_URL: process.env.FRONTEND_URL,
        // ssl
        SSL: {
            STORE_ID: process.env.SSL_STORE_ID,
            STORE_PASS: process.env.SSL_STORE_PASS,
            SSL_PAYMENT_API: process.env.SSL_PAYMENT_API,
            SSL_VALIDATION_API: process.env.SSL_VALIDATION_API,
            SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL,
            SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL,
            SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL,
            SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL,
            SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL,
            SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL,
            SSL_IPN_URL: process.env.SSL_IPN_URL
        },
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
        },
        EMAIL_SENDER: {
            SMTP_USER: process.env.SMTP_USER,
            SMTP_PASS: process.env.SMTP_PASS,
            SMTP_PORT: process.env.SMTP_PORT,
            SMTP_HOST: process.env.SMTP_HOST,
            SMTP_FROM: process.env.SMTP_FROM,
        },
        REDIS_HOST: process.env.REDIS_HOST,
        REDIS_PORT: process.env.REDIS_PORT,
        REDIS_USERNAME: process.env.REDIS_USERNAME,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD,
        TYPE: process.env.TYPE,
        PROJECT_ID: process.env.PROJECT_ID,
        PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        CLIENT_EMAIL: process.env.CLIENT_EMAIL,
        CLIENT_ID: process.env.CLIENT_ID,
        AUTH_URI: process.env.AUTH_URI,
        TOKEN_URI: process.env.TOKEN_URI,
        AUTH_PROVIDER_X509_CERT_URL: process.env
            .AUTH_PROVIDER_X509_CERT_URL,
        CLIENT_X509_CERT_URL: process.env.CLIENT_X509_CERT_URL,
        UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    };
};
exports.envVars = loadEnvVariables();
