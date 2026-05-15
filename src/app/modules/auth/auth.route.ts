/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);

// CHANGE PASSWORD
router.post('/change-password', checkAuth(...Object.keys(Role)), AuthControllers.changePassword);
// FORGET PASSWORD
router.get('/forget-password/:email', AuthControllers.forgetPassword);
// VERIFY FORGET PASSWORD OTP
router.post('/verify-otp', AuthControllers.verifyForgetPasswordOTP);
// RESET PASSWORD
router.post('/reset-password', AuthControllers.resetPassword);


// previous routes
// router.post("/change-password", checkAuth(...Object.values(Role)), AuthControllers.changePassword);
// router.post("/set-password", checkAuth(...Object.values(Role)), AuthControllers.setPassword);
// router.post("/forgot-password", AuthControllers.forgotPassword);
// router.post("/reset-password", checkAuth(...Object.values(Role)), AuthControllers.resetPassword);


// google
router.get("/google", AuthControllers.googleRegister)
router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!` }), AuthControllers.googleCallbackController)

// GOOGLE AUTH FOR APP
router.post('/google/auth/:role', AuthControllers.googleAuthSystem);

export const AuthRoutes = router;