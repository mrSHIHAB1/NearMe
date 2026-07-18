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
exports.UserServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_constant_1 = require("./user.constant");
const randomOTPGenerator_1 = require("../../utils/randomOTPGenerator");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const notification_model_1 = require("../notification/notification.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
    // console.log(email, password);
    const isUserExist = yield user_model_1.User.findOne({ email });
    if (isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exists");
    }
    if (!password) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Password is required");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const authProvider = { provider: "credentials", providerId: email };
    // console.log(email, password)
    const generateOTP = (0, randomOTPGenerator_1.randomOTPGenerator)(1000, 9999);
    const userPayload = Object.assign({ email, password: hashedPassword, auths: [authProvider], otp: generateOTP }, rest);
    const user = yield user_model_1.User.create(userPayload);
    // Send OTP to verify
    yield (0, sendEmail_1.sendEmail)({
        to: user.email,
        subject: 'User verify OTP',
        templateName: 'otp',
        templateData: {
            name: user.name,
            otp: user.otp,
        },
    });
    // Reset user OTP after 2 min
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield user_model_1.User.findByIdAndUpdate(user._id, { otp: "0" }, { new: true });
        }
        catch (error) {
            // User may have been deleted, ignore error
        }
    }), 1000 * 60 * 2);
    // Delete User if he is not verified within __ time
    setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const unverifiedUser = yield user_model_1.User.findById(user._id);
            if (unverifiedUser && !unverifiedUser.isVerified) {
                yield user_model_1.User.findByIdAndDelete(user._id);
            }
        }
        catch (error) {
            // User already deleted, ignore error
        }
    }), 1000 * 60 * 60 * 24);
    // const user = await User.create({
    //     email,
    //     password: hashedPassword,
    //     auths: [authProvider],
    //     ...rest
    // })
    return user;
});
const updateUserLocation = (userId, lat, lon) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
        coord: { lat, lon },
    }, { new: true });
    return updatedUser;
});
const verifyUserService = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log(otp, email)
    if (!email || !otp) {
        throw new AppError_1.default(400, 'OTP required!');
    }
    const isUser = yield user_model_1.User.findOne({ email }).select('-password -auths');
    if (!isUser) {
        throw new AppError_1.default(400, 'User not found by this email!');
    }
    // console.log("this is the otp",isUser.otp, otp)
    if (isUser.otp !== otp || otp.length < 4) {
        throw new AppError_1.default(400, 'Invalid OTP!');
    }
    const updateUser = yield user_model_1.User.findOneAndUpdate({ email }, { isVerified: true, otp: 0, $unset: { deleteAfter: '' } }, {
        runValidators: true,
        returnDocument: 'after',
        projection: {
            password: 0,
            otp: 0,
            auths: 0,
            otpExpireAt: 0,
            updatedAt: 0,
            createdAt: 0,
        },
    });
    // Create notification preferences for the verified user
    if (updateUser) {
        yield notification_model_1.NotificationPreference.create({
            user: updateUser._id,
            channel: {
                push: true,
                email: true,
                inApp: true,
            },
            directmsg: true,
            app: {
                product_updates: true,
                special_offers: true,
            },
            event: {
                event_invitations: true,
                event_changes: true,
                event_reminders: true,
            },
        });
    }
    return updateUser;
});
const resendOTPService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new AppError_1.default(400, 'Email required!');
    }
    const isUser = yield user_model_1.User.findOne({ email });
    if (!isUser) {
        throw new AppError_1.default(400, 'User not found by this email!');
    }
    if (isUser.isVerified) {
        throw new AppError_1.default(400, 'User already verified!');
    }
    const generateOTP = (0, randomOTPGenerator_1.randomOTPGenerator)(1000, 9999);
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min
    yield user_model_1.User.findOneAndUpdate({ email }, { otp: generateOTP, otpExpireAt: otpExpiry }, {
        runValidators: true,
        returnDocument: 'after',
        projection: {
            password: 0,
            otp: 0,
            auths: 0,
            otpExpireAt: 0,
            updatedAt: 0,
            createdAt: 0,
        },
    });
    // Send OTP to verify
    yield (0, sendEmail_1.sendEmail)({
        to: isUser.email,
        subject: 'User verify OTP',
        templateName: 'otp',
        templateData: {
            name: isUser.name,
            otp: generateOTP,
        },
    });
    return isUser;
});
const updateUser = (userId, payload, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (decodedToken.role === user_interface_1.Role.USER) {
        if (userId !== decodedToken.userId) {
            throw new AppError_1.default(401, "You are not authorized");
        }
    }
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (decodedToken.role === user_interface_1.Role.PROVIDER && ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
        throw new AppError_1.default(401, "You are not authorized");
    }
    if (payload.role) {
        if (decodedToken.role === user_interface_1.Role.USER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === user_interface_1.Role.SUPER_ADMIN && decodedToken.role === user_interface_1.Role.PROVIDER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === user_interface_1.Role.USER) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    const newUpdatedUser = yield user_model_1.User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    if (payload.picture && ifUserExist.picture) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(ifUserExist.picture);
    }
    return newUpdatedUser;
});
// // My code 
// const getAllUsers = async () => {
//     const users = await User.find({});
//     const totalUsers = await User.countDocuments();
//     return {
//         data: users,
//         meta: {
//             total: totalUsers
//         }
//     };
// }
// From PH code
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query);
    const usersData = queryBuilder
        .filter()
        .search(user_constant_1.userSearchableFields)
        .sort()
        .fields()
        .paginate();
    const [data, meta] = yield Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);
    return {
        data,
        meta
    };
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id).select("-password");
    return {
        data: user
    };
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    return {
        data: user
    };
});
const updateFcmToken = (userId, fcmToken) => __awaiter(void 0, void 0, void 0, function* () {
    return user_model_1.User.findByIdAndUpdate(userId, {
        $addToSet: {
            fcmToken: fcmToken,
        },
    }, {
        new: true,
        runValidators: true,
    });
});
const deleteUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findByIdAndDelete(userId);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found');
    }
    // Delete user's picture from Cloudinary if exists
    if (user.picture) {
        yield (0, cloudinary_config_1.deleteImageFromCLoudinary)(user.picture);
    }
    // Delete notification preferences for this user
    yield notification_model_1.NotificationPreference.deleteMany({ user: userId });
    return { success: true, message: 'User account deleted successfully' };
});
exports.UserServices = {
    createUser,
    updateUserLocation,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe,
    verifyUserService,
    resendOTPService,
    updateFcmToken,
    deleteUser
};
