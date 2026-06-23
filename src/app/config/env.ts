import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    PORT: string,
    DB_URL: string,
    NODE_ENV: "development" | "production",
    BCRYPT_SALT_ROUND: string,
    JWT_ACCESS_EXPIRES: string,
    JWT_ACCESS_SECRET: string,
    JWT_REFRESH_SECRET: string,
    JWT_REFRESH_EXPIRES: string
    OTP_JWT_ACCESS_SECRET: string,
    OTP_JWT_ACCESS_EXPIRATION: string,
    SUPER_ADMIN_EMAIL: string,
    SUPER_ADMIN_PASSWORD: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CALLBACK_URL: string,
    GOOGLE_ANDROID_CLIENT_ID: string,
    GOOGLE_IOS_CLIENT_ID: string,
    EXPRESS_SESSION_SECRET: string,
    FRONTEND_URL: string,
    SSL: {
        STORE_ID: string,
        STORE_PASS: string,
        SSL_PAYMENT_API: string,
        SSL_VALIDATION_API: string,
        SSL_SUCCESS_FRONTEND_URL: string,
        SSL_FAIL_FRONTEND_URL: string,
        SSL_CANCEL_FRONTEND_URL: string,
        SSL_SUCCESS_BACKEND_URL: string,
        SSL_FAIL_BACKEND_URL: string,
        SSL_CANCEL_BACKEND_URL: string,
        SSL_IPN_URL: string
    };
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    };
    EMAIL_SENDER: {
        SMTP_USER: string;
        SMTP_PASS: string;
        SMTP_PORT: string;
        SMTP_HOST: string;
        SMTP_FROM: string;
    };
    REDIS_HOST: string;
    REDIS_PORT: string;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;

    TYPE: string;
    PROJECT_ID: string;
    PRIVATE_KEY_ID: string;
    PRIVATE_KEY: string;
    CLIENT_EMAIL: string;
    CLIENT_ID: string;
    AUTH_URI: string;
    TOKEN_URI: string;
    AUTH_PROVIDER_X509_CERT_URL: string;
    CLIENT_X509_CERT_URL: string;
    UNIVERSE_DOMAIN: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_TEAM_ID: string;
  APPLE_KEY_ID: string;
  APPLE_PRIVATE_KEY_PATH: string;
  APPLE_CALLBACK_URL: string;
  APPLE_SHARED_SECRET: string;

}

const loadEnvVariables = (): EnvConfig => {

    const requiredEnvVariables: string[] = [
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
        'STRIPE_WEBHOOK_SECRET',
        'APPLE_CLIENT_ID',
        'APPLE_TEAM_ID',
        'APPLE_KEY_ID',
        'APPLE_PRIVATE_KEY_PATH',
        'APPLE_CALLBACK_URL',
        'APPLE_SHARED_SECRET'
    ];

    requiredEnvVariables.forEach(key => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variable ${key}`);
        }
    })
    return {
        PORT: process.env.PORT as string,
        DB_URL: process.env.DB_URL as string,
        NODE_ENV: process.env.NODE_ENV as "development" | 'production',
        BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

        JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES as string,

        OTP_JWT_ACCESS_SECRET: process.env.OTP_JWT_ACCESS_SECRET as string,
        OTP_JWT_ACCESS_EXPIRATION: process.env.OTP_JWT_ACCESS_EXPIRATION as string,

        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,

        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
        GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
        GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID as string,
        GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID as string,

        EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,

        // ssl
        SSL: {
            STORE_ID: process.env.SSL_STORE_ID as string,
            STORE_PASS: process.env.SSL_STORE_PASS as string,
            SSL_PAYMENT_API: process.env.SSL_PAYMENT_API as string,
            SSL_VALIDATION_API: process.env.SSL_VALIDATION_API as string,
            SSL_SUCCESS_FRONTEND_URL: process.env.SSL_SUCCESS_FRONTEND_URL as string,
            SSL_FAIL_FRONTEND_URL: process.env.SSL_FAIL_FRONTEND_URL as string,
            SSL_CANCEL_FRONTEND_URL: process.env.SSL_CANCEL_FRONTEND_URL as string,
            SSL_SUCCESS_BACKEND_URL: process.env.SSL_SUCCESS_BACKEND_URL as string,
            SSL_FAIL_BACKEND_URL: process.env.SSL_FAIL_BACKEND_URL as string,
            SSL_CANCEL_BACKEND_URL: process.env.SSL_CANCEL_BACKEND_URL as string,
            SSL_IPN_URL: process.env.SSL_IPN_URL as string
        },
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        },
        EMAIL_SENDER: {
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_PASS: process.env.SMTP_PASS as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_FROM: process.env.SMTP_FROM as string,
        },

        REDIS_HOST: process.env.REDIS_HOST as string,
        REDIS_PORT: process.env.REDIS_PORT as string,
        REDIS_USERNAME: process.env.REDIS_USERNAME as string,
        REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
        TYPE: process.env.TYPE as string,
        PROJECT_ID: process.env.PROJECT_ID as string,
        PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID as string,
        PRIVATE_KEY: process.env.PRIVATE_KEY as string,
        CLIENT_EMAIL: process.env.CLIENT_EMAIL as string,
        CLIENT_ID: process.env.CLIENT_ID as string,
        AUTH_URI: process.env.AUTH_URI as string,
        TOKEN_URI: process.env.TOKEN_URI as string,
        AUTH_PROVIDER_X509_CERT_URL: process.env
            .AUTH_PROVIDER_X509_CERT_URL as string,
        CLIENT_X509_CERT_URL: process.env.CLIENT_X509_CERT_URL as string,
        UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN as string,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID as string,
        APPLE_TEAM_ID: process.env.APPLE_TEAM_ID as string,
        APPLE_KEY_ID: process.env.APPLE_KEY_ID as string,
        APPLE_PRIVATE_KEY_PATH: process.env.APPLE_PRIVATE_KEY_PATH as string,
        APPLE_CALLBACK_URL: process.env.APPLE_CALLBACK_URL as string,
        APPLE_SHARED_SECRET: process.env.APPLE_SHARED_SECRET as string

    }
}

export const envVars = loadEnvVariables();