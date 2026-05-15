import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
import httpStatus from "http-status-codes"

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const accessToken = req.headers.authorization;
        // if (!accessToken) {
        //     throw new AppError(403, "No token received")
        // }

        // const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(403, "No token received");
        }

        const accessToken = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;

        const isUserExist = await User.findOne({ email: verifiedToken.email });

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
        }

        if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
        }

        if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
        }
        // if(!isUserExist.isVerified){
        //     throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
        // }

        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route")
        }
        req.user = verifiedToken;
        // console.log("AUTH HEADER:", req.headers.authorization);
        next();

    } catch (error) {
        next(error)
    }
}