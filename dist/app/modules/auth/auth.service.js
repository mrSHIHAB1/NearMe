"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
const http_status_codes_1 = __importStar(require("http-status-codes"));
const user_interface_1 = require("../user/user.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const userToken_1 = require("../../utils/userToken");
const sendEmail_1 = require("../../utils/sendEmail");
const randomOTPGenerator_1 = require("../../utils/randomOTPGenerator");
const redis_config_1 = require("../../config/redis.config");
const jose_1 = require("jose");
const axios_1 = __importDefault(require("axios"));
const credentialsLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    const IsPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
    if (!IsPasswordMatched) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Password does not matched");
    }
    const userTokens = (0, userToken_1.createUserTokens)(isUserExist);
    const _a = isUserExist.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest
    };
});
const getNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userToken_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken
    };
});
// CHANGE PASSWORD
const changePassword = (userId, oldPassword, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select('+password');
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found!');
    }
    if (!oldPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide your old password!');
    }
    if (!newPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please provide your new password!');
    }
    const matchPassword = yield bcryptjs_1.default.compare(oldPassword, user.password);
    if (!matchPassword) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Password doesn't matched!");
    }
    //   console.log(newPassword);
    user.password = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    yield user.save();
    return null;
});
// FORGET PASSWORD
const forgetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found!');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'User was deleted!');
    }
    if (user.isActive === user_interface_1.IsActive.INACTIVE ||
        user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${user.isActive}`);
    }
    const otp = (0, randomOTPGenerator_1.randomOTPGenerator)(100000, 999999).toString(); // Generate OTP
    const hashedOTP = yield bcryptjs_1.default.hash(otp, Number(env_1.envVars.BCRYPT_SALT_ROUND)); // Hashed OTP
    // CACHED OTP TO REDIS
    // await redisClient.set(`otp:${user.email}`, hashedOTP, { EX: 120 }); // 2 min
    yield redis_config_1.redisClient.set(`otp:${user.email}`, hashedOTP, "EX", 120);
    // SENDING OTP TO EMAIL
    yield (0, sendEmail_1.sendEmail)({
        to: user.email,
        subject: 'Near Me: Password Reset OTP',
        templateName: 'forgetPassword_otp_send',
        templateData: {
            name: user.name,
            expirationTime: 2,
            otp,
        },
    });
    return null;
});
// VERIFY RESET PASSWORD OTP
const verifyForgetPasswordOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Email required!');
    }
    // CHECK USER
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'No user found!');
    }
    if (!otp || otp.length < 6) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Wrong OTP!');
    }
    // OTP MATCHING PART
    const getOTP = yield redis_config_1.redisClient.get(`otp:${email}`);
    if (!getOTP) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'OTP has expired!');
    }
    // Matching otp
    const isOTPMatched = yield bcryptjs_1.default.compare(otp, getOTP); // COMPARE WITH OTP
    if (!isOTPMatched) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'OTP is not matched!');
    }
    const jwtPayload = { email, verified: true };
    const jwtToken = jsonwebtoken_1.default.sign(jwtPayload, env_1.envVars.OTP_JWT_ACCESS_SECRET, {
        expiresIn: env_1.envVars.OTP_JWT_ACCESS_EXPIRATION,
    });
    // DELETED OTP AFTER USED
    yield redis_config_1.redisClient.del(`otp:${email}`);
    return jwtToken;
});
// RESET PASSWORD
const resetPassword = (token, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Token must required!');
    }
    const verifyToken = jsonwebtoken_1.default.verify(token, env_1.envVars.OTP_JWT_ACCESS_SECRET);
    if (!verifyToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Invalid token or expired!');
    }
    if (!(verifyToken === null || verifyToken === void 0 ? void 0 : verifyToken.verified)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "OTP wasn't verified yet");
    }
    // CHECK USER
    const user = yield user_model_1.User.findOne({ email: verifyToken === null || verifyToken === void 0 ? void 0 : verifyToken.email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'No user found!');
    }
    // SET NEW PASSWORD
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    user.password = hashedPassword;
    yield user.save();
    return null;
});
// =============================GOOGLE REGISTER/LOGIN HANDLING FOR APPLE (NO REDIRECT SYSTEM)===============
const googleJWKS = (0, jose_1.createRemoteJWKSet)(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const buildGoogleAllowedClientIds = () => {
    const rawClientIds = [`${env_1.envVars.GOOGLE_ANDROID_CLIENT_ID},${env_1.envVars.GOOGLE_IOS_CLIENT_ID}`]
        .join(',')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    return new Set(rawClientIds);
};
const googleAuthSystem = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const roleParam = payload === null || payload === void 0 ? void 0 : payload.role;
    if (!roleParam || !Object.values(user_interface_1.Role).includes(roleParam)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid or missing role parameter');
    }
    if (!payload || typeof payload !== 'object') {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Invalid Google auth payload');
    }
    const idToken = typeof (payload === null || payload === void 0 ? void 0 : payload.id_token) === 'string' ? payload.id_token.trim() : '';
    const accessToken = typeof (payload === null || payload === void 0 ? void 0 : payload.access_token) === 'string' ? payload.access_token.trim() : '';
    if (!idToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Google id_token is required');
    }
    const googleAllowedClientIds = buildGoogleAllowedClientIds();
    // const googleAllowedClientIds: string[] = [env.GOOGLE_ANDROID_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID, env.GOOGLE_WEB_CLIENT_ID as string];
    if (!googleAllowedClientIds.size) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Google OAuth client ids are not configured');
    }
    let verifiedGooglePayload;
    try {
        const { payload: verifiedPayload } = yield (0, jose_1.jwtVerify)(idToken, googleJWKS, {
            issuer: ['https://accounts.google.com', 'accounts.google.com'],
        });
        verifiedGooglePayload = verifiedPayload;
    }
    catch (error) {
        const reason = env_1.envVars.NODE_ENV === 'development' && (error === null || error === void 0 ? void 0 : error.message)
            ? `: ${error.message}`
            : '';
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, `Invalid Google id_token${reason}`);
    }
    const audienceList = Array.isArray(verifiedGooglePayload.aud)
        ? verifiedGooglePayload.aud
            .map((aud) => (typeof aud === 'string' ? aud.trim() : ''))
            .filter(Boolean)
        : typeof verifiedGooglePayload.aud === 'string'
            ? [verifiedGooglePayload.aud.trim()].filter(Boolean)
            : [];
    const azp = typeof verifiedGooglePayload.azp === 'string'
        ? verifiedGooglePayload.azp.trim()
        : '';
    const audienceMatched = audienceList.some((aud) => googleAllowedClientIds.has(aud));
    const azpMatched = azp ? googleAllowedClientIds.has(azp) : false;
    if (!audienceMatched && !azpMatched) {
        const reason = env_1.envVars.NODE_ENV === 'development'
            ? ` | aud=${audienceList.join(',') || 'N/A'} | azp=${azp || 'N/A'} | allowed=${Array.from(googleAllowedClientIds).join(',')}`
            : '';
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, `Google id_token audience mismatch${reason}`);
    }
    const googleUserId = typeof verifiedGooglePayload.sub === 'string'
        ? verifiedGooglePayload.sub.trim()
        : '';
    const verifiedEmail = typeof verifiedGooglePayload.email === 'string'
        ? verifiedGooglePayload.email.toLowerCase().trim()
        : '';
    if (!googleUserId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google user id not found in token');
    }
    if (!verifiedEmail || verifiedGooglePayload.email_verified !== true) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google email is not verified');
    }
    const requestEmail = typeof (payload === null || payload === void 0 ? void 0 : payload.email) === 'string' ? payload.email.toLowerCase().trim() : '';
    if (requestEmail && requestEmail !== verifiedEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google payload email mismatch');
    }
    if (accessToken) {
        try {
            const { data: googleUserInfo } = yield axios_1.default.get('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const accessTokenSub = typeof (googleUserInfo === null || googleUserInfo === void 0 ? void 0 : googleUserInfo.sub) === 'string'
                ? googleUserInfo.sub.trim()
                : '';
            const accessTokenEmail = typeof (googleUserInfo === null || googleUserInfo === void 0 ? void 0 : googleUserInfo.email) === 'string'
                ? googleUserInfo.email.toLowerCase().trim()
                : '';
            if (!accessTokenSub || accessTokenSub !== googleUserId) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google token mismatch');
            }
            if (accessTokenEmail && accessTokenEmail !== verifiedEmail) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google token email mismatch');
            }
            if (googleUserInfo.email_verified === false) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google access token email is not verified');
            }
        }
        catch (error) {
            if (error instanceof AppError_1.default) {
                throw error;
            }
            if (axios_1.default.isAxiosError(error)) {
                throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google access_token validation failed');
            }
            throw error;
        }
    }
    const fallbackName = verifiedEmail.split('@')[0] || 'Google User';
    const providerName = typeof verifiedGooglePayload.name === 'string'
        ? verifiedGooglePayload.name.trim()
        : '';
    const requestName = typeof (payload === null || payload === void 0 ? void 0 : payload.name) === 'string' ? payload.name.trim() : '';
    const userName = providerName || requestName || fallbackName;
    // eslint-disable-next-line no-useless-assignment
    let user = null;
    try {
        user = yield user_model_1.User.findOneAndUpdate({
            email: verifiedEmail,
            $or: [
                { auths: { $not: { $elemMatch: { provider: 'google' } } } },
                { auths: { $elemMatch: { provider: 'google', providerId: googleUserId } } },
            ],
        }, {
            $set: {
                isVerified: true,
            },
            $addToSet: {
                auths: {
                    provider: 'google',
                    providerId: googleUserId,
                },
            },
            $setOnInsert: {
                user_name: userName,
                email: verifiedEmail,
                role: roleParam,
            },
        }, { upsert: true, new: true });
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Google account mismatch for this email');
        }
        throw error;
    }
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Authentication failed');
    }
    if (user.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'User was deleted!');
    }
    if (user.isActive === user_interface_1.IsActive.INACTIVE ||
        user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
    }
    const userTokens = yield (0, userToken_1.createUserTokens)({
        _id: user._id,
        email: user.email,
        role: user.role
    });
    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
    };
});
exports.AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    resetPassword,
    forgetPassword,
    verifyForgetPasswordOTP,
    googleAuthSystem
};
