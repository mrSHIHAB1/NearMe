/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userToken";
import { IUser } from "./user.interface";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const user = await UserServices.createUser(req.body);

  res.cookie('email', user.email, {
    httpOnly: true,
    secure: false,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: user
  })
})

const updateUserLocation = catchAsync(async (req: Request, res: Response) => {
  const { lat, lon } = req.body;
  const decodedToken = req.user as JwtPayload;

  const result = await UserServices.updateUserLocation(
    decodedToken.userId,
    lat,
    lon
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User location updated successfully',
    data: result,
  });
});


const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const email = req.body.email as string;
  const otp = req.body.otp as string;


  const result = await UserServices.verifyUserService(
    email,
    otp as string
  );

  const jwtPayload = {
    _id: result?._id,
    email: result?.email,
    role: result?.role,
    isVerified: result?.isVerified,
  };

  // Set refreshToken and accessToken in Cookies
  const userTokens = await createUserTokens(jwtPayload);
  setAuthCookie(res, userTokens);


  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User verified successfuly!',
    data: {
      data: result,
    },
  });
});

const resendOTP = catchAsync(async (req: Request, res: Response) => {
  // const email = req.cookies['email'] as string;
  const email = req.body.email as string;
  await UserServices.resendOTPService(email);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'OTP Sent Successfully!',
    data: null,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id as string;


  const verifiedToken = req.user;

  const payload: Partial<IUser> = {
    ... req.body,
    picture: req.file?.path
  }
  const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User updated successfully",
    data: user
  })
})


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;
  const result = await UserServices.getAllUsers(query as Record<string, string>);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All Users Retrieved Successfully",
    data: result.data,
    meta: result.meta
  })
})

const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const decodedToken = req.user as JwtPayload
  const result = await UserServices.getMe(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Your profile Retrieved Successfully",
    data: result.data
  })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  const result = await UserServices.getSingleUser(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Retrieved Successfully",
    data: result.data
  })
})
export const UserControllers = {
  createUser,
  updateUserLocation,
  getAllUsers,
  updateUser,
  getSingleUser,
  getMe,
  verifyUser,
  resendOTP
}