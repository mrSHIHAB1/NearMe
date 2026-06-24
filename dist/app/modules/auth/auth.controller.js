"use strict";
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
exports.AuthControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const setCookie_1 = require("../../utils/setCookie");
const userToken_1 = require("../../utils/userToken");
const env_1 = require("../../config/env");
const passport_1 = __importDefault(require("passport"));
const user_interface_1 = require("../user/user.interface");
const buildGoogleState = (redirect, role) => {
    const params = new URLSearchParams();
    if (role) {
        params.set("role", role);
    }
    if (redirect) {
        params.set("redirect", redirect);
    }
    return params.toString();
};
const parseGoogleState = (state) => {
    const params = new URLSearchParams(state || "");
    const redirect = params.get("redirect") || "/";
    const role = params.get("role") || undefined;
    return { redirect, role };
};
const credentialsLogin = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    passport_1.default.authenticate("local", (err, user, info) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log(err)
        if (err) {
            // console.log("from err", err)
            return next(new AppError_1.default(err.statusCode || 401, err.message));
        }
        if (!user) {
            // console.log("from !user", err)
            return next(new AppError_1.default(401, info.message));
        }
        const userToken = yield (0, userToken_1.createUserTokens)(user);
        const _a = user.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
        (0, setCookie_1.setAuthCookie)(res, userToken);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "User logged in successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        });
    }))(req, res, next);
}));
const getNewAccessToken = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = yield auth_service_1.AuthServices.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "New Access Token Retrieved successfully",
        data: tokenInfo
    });
}));
const logout = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User logged out successfully",
        data: null
    });
}));
// CHANGE PASSWORD
const changePassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { oldPassword, newPassword } = req.body;
    yield auth_service_1.AuthServices.changePassword(userId, oldPassword, newPassword);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password has been changed',
        data: null,
    });
}));
// FORGET PASSWORD
const forgetPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    const result = yield auth_service_1.AuthServices.forgetPassword(email);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password reset OTP sent',
        data: result,
    });
}));
// VERIFY FORGET PASSWORD OTP
const verifyForgetPasswordOTP = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    const result = yield auth_service_1.AuthServices.verifyForgetPasswordOTP(email, otp);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'OTP verified',
        data: result,
    });
}));
// RESET PASSWORD
const resetPassword = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers.token;
    const { newPassword } = req.body;
    const result = yield auth_service_1.AuthServices.resetPassword(token, newPassword);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Password reset success',
        data: result,
    });
}));
const googleRegister = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const roleParam = typeof req.query.role === "string" ? req.query.role : undefined;
    if (roleParam && !Object.values(user_interface_1.Role).includes(roleParam)) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid role parameter");
    }
    const state = buildGoogleState(redirect, roleParam);
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next);
}));
const googleRegisterUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const state = buildGoogleState(redirect, user_interface_1.Role.USER);
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next);
}));
const googleRegisterProvider = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const state = buildGoogleState(redirect, user_interface_1.Role.PROVIDER);
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next);
}));
const googleCallbackController = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const stateValue = typeof req.query.state === "string" ? req.query.state : "";
    let { redirect: redirectTo } = parseGoogleState(stateValue);
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    const tokenInfo = yield (0, userToken_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect(`${env_1.envVars === null || env_1.envVars === void 0 ? void 0 : env_1.envVars.FRONTEND_URL}/${redirectTo}`);
}));
// REGISTER WITH GOOGLE FOR APPLE DEVICE
const googleAuthSystem = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roleParam = typeof req.params.role === "string" ? req.params.role : undefined;
    const safeBody = req.body && typeof req.body === "object" ? req.body : {};
    const payload = Object.assign(Object.assign({}, safeBody), { role: roleParam || safeBody.role });
    const result = yield auth_service_1.AuthServices.googleAuthSystem(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Authentication success',
        data: result,
    });
}));
const googleappAuthSystem = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const safeBody = req.body && typeof req.body === 'object' ? req.body : {};
    if (!safeBody.id_token || typeof safeBody.id_token !== 'string') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'id_token is required in request body');
    }
    const result = yield auth_service_1.AuthServices.googleappAuthSystem(safeBody);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Authentication success',
        data: result,
    });
}));
const googleAuthSystemUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const safeBody = req.body && typeof req.body === "object" ? req.body : {};
    const payload = Object.assign(Object.assign({}, safeBody), { role: user_interface_1.Role.USER });
    const result = yield auth_service_1.AuthServices.googleAuthSystem(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Authentication success',
        data: result,
    });
}));
const googleAuthSystemProvider = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const safeBody = req.body && typeof req.body === "object" ? req.body : {};
    const payload = Object.assign(Object.assign({}, safeBody), { role: user_interface_1.Role.PROVIDER });
    const result = yield auth_service_1.AuthServices.googleAuthSystem(payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'Authentication success',
        data: result,
    });
}));
const appleLoginController = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { identityToken } = req.body;
    if (!identityToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "identityToken required");
    }
    const roleParam = typeof req.body.role === 'string' ? req.body.role : undefined;
    const result = yield (0, auth_service_1.appleLogin)(identityToken, roleParam || undefined);
    // service returns { accessToken, refreshToken, user }
    if (result && result.accessToken && result.refreshToken) {
        (0, setCookie_1.setAuthCookie)(res, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
        return (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: 'Authentication success',
            data: result,
        });
    }
    return (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Authentication result',
        data: result,
    });
}));
exports.AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    resetPassword,
    verifyForgetPasswordOTP,
    forgetPassword,
    googleCallbackController,
    googleRegister,
    googleRegisterUser,
    googleRegisterProvider,
    googleAuthSystem,
    googleAuthSystemUser,
    googleAuthSystemProvider,
    appleLoginController,
    googleappAuthSystem
};
