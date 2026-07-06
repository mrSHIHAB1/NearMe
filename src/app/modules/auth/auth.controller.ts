/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from 'http-status-codes';
import { sendResponse } from "../../utils/sendResponse";
import { appleLogin, AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userToken";
import { envVars } from "../../config/env";
import passport from "passport";
import { Role } from "../user/user.interface";

const buildGoogleState = (redirect: string, role?: string) => {
    const params = new URLSearchParams();
    if (role) {
        params.set("role", role);
    }
    if (redirect) {
        params.set("redirect", redirect);
    }
    return params.toString();
};

const parseGoogleState = (state?: string) => {
    const params = new URLSearchParams(state || "");
    const redirect = params.get("redirect") || "/";
    const role = params.get("role") || undefined;
    return { redirect, role };
};

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
        // console.log(err)
        if (err) {
            // console.log("from err", err)
            return next(new AppError(err.statusCode || 401, err.message));
        }

        if (!user) {
            // console.log("from !user", err)
            return next(new AppError(401, info.message));
        }

        const userToken = await createUserTokens(user);

        const { password: pass, ...rest } = user.toObject();

        setAuthCookie(res, userToken)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User logged in successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            }
        })
    })(req, res, next)
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved successfully",
        data: tokenInfo
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User logged out successfully",
        data: null
    })
})

// CHANGE PASSWORD
const changePassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.user as JwtPayload;
        const { oldPassword, newPassword } = req.body;
        await AuthServices.changePassword(userId, oldPassword, newPassword);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password has been changed',
            data: null,
        });
    }
);

// FORGET PASSWORD
const forgetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.params;
        const result = await AuthServices.forgetPassword(email as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password reset OTP sent',
            data: result,
        });
    }
);

// VERIFY FORGET PASSWORD OTP
const verifyForgetPasswordOTP = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, otp } = req.body;
        const result = await AuthServices.verifyForgetPasswordOTP(
            email as string,
            otp
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'OTP verified',
            data: result,
        });
    }
);

// RESET PASSWORD
const resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.token as string;

        const { newPassword } = req.body;
        const result = await AuthServices.resetPassword(token, newPassword);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Password reset success',
            data: result,
        });
    }
);


const googleRegister = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const roleParam = typeof req.query.role === "string" ? req.query.role : undefined;

    if (roleParam && !Object.values(Role).includes(roleParam as Role)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid role parameter");
    }

    const state = buildGoogleState(redirect, roleParam);

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next)
})

const googleRegisterUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const state = buildGoogleState(redirect, Role.USER);

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next)
})

const googleRegisterProvider = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const redirect = typeof req.query.redirect === "string" ? req.query.redirect : "/";
    const state = buildGoogleState(redirect, Role.PROVIDER);

    passport.authenticate("google", {
        scope: ["profile", "email"],
        state,
        prompt: "consent select_account"
    })(req, res, next)
})

const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const stateValue = typeof req.query.state === "string" ? req.query.state : "";
    let { redirect: redirectTo } = parseGoogleState(stateValue);

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const tokenInfo = await createUserTokens(user);

    setAuthCookie(res, tokenInfo);
    res.redirect(`${envVars?.FRONTEND_URL}/${redirectTo}`)
})

// REGISTER WITH GOOGLE FOR APPLE DEVICE
const googleAuthSystem = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const roleParam = typeof req.params.role === "string" ? req.params.role : undefined;
        const safeBody = req.body && typeof req.body === "object" ? req.body : {};
        const payload = {
                ...safeBody,
                role: roleParam || (safeBody as { role?: string }).role,
        };

        const result = await AuthServices.googleAuthSystem(payload);

        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: 'Authentication success',
            data: result,
        })
    }
);


const googleappAuthSystem = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
        const safeBody = req.body && typeof req.body === 'object' ? req.body : {};
        if (!safeBody.id_token || typeof safeBody.id_token !== 'string') {
            throw new AppError(httpStatus.BAD_REQUEST, 'id_token is required in request body');
        }

        const result = await AuthServices.googleappAuthSystem(safeBody as any);
        console.log('Google Auth Result:', result);
        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: 'Authentication success',
            data: result,
        });
  }
);

const googleAuthSystemUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const safeBody = req.body && typeof req.body === "object" ? req.body : {};
        const payload = {
                ...safeBody,
                role: Role.USER,
        };

        const result = await AuthServices.googleAuthSystem(payload);

        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: 'Authentication success',
            data: result,
        })
    }
);

const googleAuthSystemProvider = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const safeBody = req.body && typeof req.body === "object" ? req.body : {};
        const payload = {
                ...safeBody,
                role: Role.PROVIDER,
        };

        const result = await AuthServices.googleAuthSystem(payload);

        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: 'Authentication success',
            data: result,
        })
    }
);
const appleLoginController = catchAsync(async (req: Request, res: Response) => {
  const { identityToken } = req.body;

  if (!identityToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "identityToken required");
  }

    const roleParam = typeof req.body.role === 'string' ? req.body.role : undefined;

    const result = await appleLogin(identityToken, (roleParam as Role) || undefined);

    // service returns { accessToken, refreshToken, user }
    if (result && result.accessToken && result.refreshToken) {
        setAuthCookie(res, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });

        return sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: 'Authentication success',
            data: result,
        });
    }

    return sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Authentication result',
        data: result,
    });
});
export const AuthControllers = {
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
}