/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus, { StatusCodes } from 'http-status-codes';
import { IAuthProvider, IsActive, IUser, Role } from "../user/user.interface"
import AppError from '../../errorHelpers/AppError';
import { User } from '../user/user.model';
import bcryptjs from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt';
import { envVars } from '../../config/env';
import { createNewAccessTokenWithRefreshToken, createUserTokens } from '../../utils/userToken';
import { sendEmail } from '../../utils/sendEmail';
import { randomOTPGenerator } from '../../utils/randomOTPGenerator';
import { redisClient } from '../../config/redis.config';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { GoogleIdTokenPayload, GoogleUserInfoPayload } from './auth.interface';
import axios from 'axios';

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  const IsPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

  if (!IsPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Password does not matched");
  }

  const userTokens = createUserTokens(isUserExist);


  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest
  }
}

const getNewAccessToken = async (refreshToken: string) => {

  const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken
  }
}

// CHANGE PASSWORD
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (!oldPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide your old password!'
    );
  }

  if (!newPassword) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide your new password!'
    );
  }

  const matchPassword = await bcryptjs.compare(
    oldPassword,
    user.password as string
  );
  if (!matchPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Password doesn't matched!");
  }

  //   console.log(newPassword);

  user.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND));
  await user.save();

  return null;
};

// FORGET PASSWORD
const forgetPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User was deleted!');
  }

  if (
    user.isActive === IsActive.INACTIVE ||
    user.isActive === IsActive.BLOCKED
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is ${user.isActive}`);
  }

  const otp = randomOTPGenerator(100000, 999999).toString(); // Generate OTP
  const hashedOTP = await bcryptjs.hash(otp, Number(envVars.BCRYPT_SALT_ROUND)); // Hashed OTP

  // CACHED OTP TO REDIS
  await redisClient.set(`otp:${user.email}`, hashedOTP, { EX: 120 }); // 2 min

  // SENDING OTP TO EMAIL
  await sendEmail({
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
};

// VERIFY RESET PASSWORD OTP
const verifyForgetPasswordOTP = async (email: string, otp: string) => {
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email required!');
  }

  // CHECK USER
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found!');
  }

  if (!otp || otp.length < 6) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Wrong OTP!');
  }

  // OTP MATCHING PART
  const getOTP = await redisClient.get(`otp:${email}`);

  if (!getOTP) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP has expired!');
  }

  // Matching otp
  const isOTPMatched = await bcryptjs.compare(otp, getOTP); // COMPARE WITH OTP
  if (!isOTPMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP is not matched!');
  }

  const jwtPayload = { email, verified: true };
  const jwtToken = jwt.sign(jwtPayload, envVars.OTP_JWT_ACCESS_SECRET, {
    expiresIn: envVars.OTP_JWT_ACCESS_EXPIRATION,
  } as SignOptions);

  // DELETED OTP AFTER USED
  await redisClient.del(`otp:${email}`);
  return jwtToken;
};

// RESET PASSWORD
const resetPassword = async (token: string, newPassword: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token must required!');
  }

  const verifyToken = jwt.verify(
    token,
    envVars.OTP_JWT_ACCESS_SECRET
  ) as JwtPayload;

  if (!verifyToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token or expired!');
  }

  if (!verifyToken?.verified) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP wasn't verified yet");
  }

  // CHECK USER
  const user = await User.findOne({ email: verifyToken?.email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'No user found!');
  }

  // SET NEW PASSWORD
  const hashedPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user.password = hashedPassword;
  await user.save();

  return null;
};

// =============================GOOGLE REGISTER/LOGIN HANDLING FOR APPLE (NO REDIRECT SYSTEM)===============
const googleJWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

const buildGoogleAllowedClientIds = () => {
  const rawClientIds = [`${envVars.GOOGLE_ANDROID_CLIENT_ID},${envVars.GOOGLE_IOS_CLIENT_ID}`]
    .join(',')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return new Set(rawClientIds);
};


const googleAuthSystem = async (payload: any) => {
  const roleParam = payload?.role;
  if (!roleParam || !Object.values(Role).includes(roleParam)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid or missing role parameter');
  }
  if (!payload || typeof payload !== 'object') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid Google auth payload');
  }

  const idToken =
    typeof payload?.id_token === 'string' ? payload.id_token.trim() : '';
  const accessToken =
    typeof payload?.access_token === 'string' ? payload.access_token.trim() : '';

  if (!idToken) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Google id_token is required');
  }

  const googleAllowedClientIds = buildGoogleAllowedClientIds();
  // const googleAllowedClientIds: string[] = [env.GOOGLE_ANDROID_CLIENT_ID, env.GOOGLE_IOS_CLIENT_ID, env.GOOGLE_WEB_CLIENT_ID as string];

  if (!googleAllowedClientIds.size) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Google OAuth client ids are not configured'
    );
  }

  let verifiedGooglePayload: GoogleIdTokenPayload;
  try {
    const { payload: verifiedPayload } = await jwtVerify(idToken, googleJWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    });

    verifiedGooglePayload = verifiedPayload as GoogleIdTokenPayload;
  } catch (error: any) {
    const reason =
      envVars.NODE_ENV === 'development' && error?.message
        ? `: ${error.message}`
        : '';

    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      `Invalid Google id_token${reason}`
    );
  }

  const audienceList = Array.isArray(verifiedGooglePayload.aud)
    ? verifiedGooglePayload.aud
      .map((aud) => (typeof aud === 'string' ? aud.trim() : ''))
      .filter(Boolean)
    : typeof verifiedGooglePayload.aud === 'string'
      ? [verifiedGooglePayload.aud.trim()].filter(Boolean)
      : [];
  const azp =
    typeof verifiedGooglePayload.azp === 'string'
      ? verifiedGooglePayload.azp.trim()
      : '';

  const audienceMatched = audienceList.some((aud) =>
    googleAllowedClientIds.has(aud)
  );
  const azpMatched = azp ? googleAllowedClientIds.has(azp) : false;

  if (!audienceMatched && !azpMatched) {
    const reason =
      envVars.NODE_ENV === 'development'
        ? ` | aud=${audienceList.join(',') || 'N/A'} | azp=${azp || 'N/A'} | allowed=${Array.from(googleAllowedClientIds).join(',')}`
        : '';

    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      `Google id_token audience mismatch${reason}`
    );
  }

  const googleUserId =
    typeof verifiedGooglePayload.sub === 'string'
      ? verifiedGooglePayload.sub.trim()
      : '';
  const verifiedEmail =
    typeof verifiedGooglePayload.email === 'string'
      ? verifiedGooglePayload.email.toLowerCase().trim()
      : '';

  if (!googleUserId) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Google user id not found in token'
    );
  }

  if (!verifiedEmail || verifiedGooglePayload.email_verified !== true) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Google email is not verified'
    );
  }

  const requestEmail =
    typeof payload?.email === 'string' ? payload.email.toLowerCase().trim() : '';
  if (requestEmail && requestEmail !== verifiedEmail) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Google payload email mismatch');
  }

  if (accessToken) {
    try {
      const { data: googleUserInfo } = await axios.get<GoogleUserInfoPayload>(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const accessTokenSub =
        typeof googleUserInfo?.sub === 'string'
          ? googleUserInfo.sub.trim()
          : '';
      const accessTokenEmail =
        typeof googleUserInfo?.email === 'string'
          ? googleUserInfo.email.toLowerCase().trim()
          : '';

      if (!accessTokenSub || accessTokenSub !== googleUserId) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Google token mismatch');
      }

      if (accessTokenEmail && accessTokenEmail !== verifiedEmail) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Google token email mismatch'
        );
      }

      if (googleUserInfo.email_verified === false) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Google access token email is not verified'
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'Google access_token validation failed'
        );
      }

      throw error;
    }
  }

  const fallbackName = verifiedEmail.split('@')[0] || 'Google User';
  const providerName =
    typeof verifiedGooglePayload.name === 'string'
      ? verifiedGooglePayload.name.trim()
      : '';
  const requestName =
    typeof payload?.name === 'string' ? payload.name.trim() : '';
  const userName = providerName || requestName || fallbackName;

  // eslint-disable-next-line no-useless-assignment
  let user = null;
  try {
    user = await User.findOneAndUpdate(
      {
        email: verifiedEmail,
        $or: [
          { auths: { $not: { $elemMatch: { provider: 'google' } } } },
          { auths: { $elemMatch: { provider: 'google', providerId: googleUserId } } },
        ],
      },
      {
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
          role: roleParam as Role,
        },
      },
      { upsert: true, new: true }
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'Google account mismatch for this email'
      );
    }
    throw error;
  }

  if (!user) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Authentication failed');
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'User was deleted!');
  }

  if (
    user.isActive === IsActive.INACTIVE ||
    user.isActive === IsActive.BLOCKED
  ) {
    throw new AppError(StatusCodes.BAD_REQUEST, `User is ${user.isActive}`);
  }

  const userTokens = await createUserTokens({
    _id: user._id,
    email: user.email,
    role: user.role
  });

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
  };
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  resetPassword,
  forgetPassword,
  verifyForgetPasswordOTP,
  googleAuthSystem
}