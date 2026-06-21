"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
router.post("/login", auth_controller_1.AuthControllers.credentialsLogin);
router.post("/refresh-token", auth_controller_1.AuthControllers.getNewAccessToken);
router.post("/logout", auth_controller_1.AuthControllers.logout);
// CHANGE PASSWORD
router.post('/change-password', (0, checkAuth_1.checkAuth)(...Object.keys(user_interface_1.Role)), auth_controller_1.AuthControllers.changePassword);
// FORGET PASSWORD
router.get('/forget-password/:email', auth_controller_1.AuthControllers.forgetPassword);
// VERIFY FORGET PASSWORD OTP
router.post('/verify-otp', auth_controller_1.AuthControllers.verifyForgetPasswordOTP);
// RESET PASSWORD
router.post('/reset-password', auth_controller_1.AuthControllers.resetPassword);
// previous routes
// router.post("/change-password", checkAuth(...Object.values(Role)), AuthControllers.changePassword);
// router.post("/set-password", checkAuth(...Object.values(Role)), AuthControllers.setPassword);
// router.post("/forgot-password", AuthControllers.forgotPassword);
// router.post("/reset-password", checkAuth(...Object.values(Role)), AuthControllers.resetPassword);
// google
router.get("/google", auth_controller_1.AuthControllers.googleRegister);
router.get("/google/user", auth_controller_1.AuthControllers.googleRegisterUser);
router.get("/google/provider", auth_controller_1.AuthControllers.googleRegisterProvider);
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: `${env_1.envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!` }), auth_controller_1.AuthControllers.googleCallbackController);
// GOOGLE AUTH FOR APP
router.post('/google/auth/user', auth_controller_1.AuthControllers.googleAuthSystemUser);
router.post('/google/auth/provider', auth_controller_1.AuthControllers.googleAuthSystemProvider);
router.post('/google/auth/:role', auth_controller_1.AuthControllers.googleAuthSystem);
exports.AuthRoutes = router;
