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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_service_1 = require("./user.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const setCookie_1 = require("../../utils/setCookie");
const userToken_1 = require("../../utils/userToken");
const createUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.UserServices.createUser(req.body);
    res.cookie('email', user.email, {
        httpOnly: true,
        secure: false,
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User created successfully",
        data: user
    });
}));
const updateUserLocation = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lat, lon } = req.body;
    const decodedToken = req.user;
    const result = yield user_service_1.UserServices.updateUserLocation(decodedToken.userId, lat, lon);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'User location updated successfully',
        data: result,
    });
}));
const verifyUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const otp = req.body.otp;
    const result = yield user_service_1.UserServices.verifyUserService(email, otp);
    const jwtPayload = {
        _id: result === null || result === void 0 ? void 0 : result._id,
        email: result === null || result === void 0 ? void 0 : result.email,
        role: result === null || result === void 0 ? void 0 : result.role,
        isVerified: result === null || result === void 0 ? void 0 : result.isVerified,
    };
    // Set refreshToken and accessToken in Cookies
    const userTokens = yield (0, userToken_1.createUserTokens)(jwtPayload);
    (0, setCookie_1.setAuthCookie)(res, userTokens);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'User verified successfuly!',
        data: {
            data: result,
        },
    });
}));
const resendOTP = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const email = req.cookies['email'] as string;
    const email = req.body.email;
    yield user_service_1.UserServices.resendOTPService(email);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 200,
        message: 'OTP Sent Successfully!',
        data: null,
    });
}));
const updateUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = Object.assign(Object.assign({}, req.body), { picture: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const user = yield user_service_1.UserServices.updateUser(userId, payload, verifiedToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User updated successfully",
        data: user
    });
}));
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield user_service_1.UserServices.getAllUsers(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta: result.meta
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const result = yield user_service_1.UserServices.getMe(decodedToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "Your profile Retrieved Successfully",
        data: result.data
    });
}));
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const result = yield user_service_1.UserServices.getSingleUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User Retrieved Successfully",
        data: result.data
    });
}));
exports.UserControllers = {
    createUser,
    updateUserLocation,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe,
    verifyUser,
    resendOTP
};
