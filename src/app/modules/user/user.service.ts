
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes';
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";
import { randomOTPGenerator } from "../../utils/randomOTPGenerator";
import { sendEmail } from "../../utils/sendEmail";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createUser = async (payload: Partial<IUser>) => {

    const { email, password, ...rest } = payload;
    // console.log(email, password);
    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists")
    }

    if (!password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password is required");
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string };
    // console.log(email, password)

    const generateOTP = randomOTPGenerator(1000, 9999);

    const userPayload = {
        email,
        password: hashedPassword,
        auths: [authProvider],
        otp: generateOTP,

        ...rest,
    };

    const user = await User.create(userPayload as IUser);

    // Send OTP to verify
    sendEmail({
        to: user.email,
        subject: 'User verify OTP',
        templateName: 'otp',
        templateData: {
            name: user.name,
            otp: user.otp,
        },
    });


    // Reset user OTP after 2 min
    setTimeout(async () => {
        user.otp = "0";
        user.save();
    }, 1000 * 60 * 2);

    // Delete User if he is not verified within __ time
    setTimeout(async () => {
        if (!user.isVerified) {
            await User.findByIdAndDelete(user._id);
        }
    }, 1000 * 60 * 60 * 24);

    // const user = await User.create({
    //     email,
    //     password: hashedPassword,
    //     auths: [authProvider],
    //     ...rest
    // })

    return user;
}

const updateUserLocation = async (
  userId: string,
  lat: number,
  lon: number
) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      coord: { lat, lon },
    },
    { new: true }
  );

  return updatedUser;
};


const verifyUserService = async (email: string, otp: string) => {
    // console.log(otp, email)
    if (!email || !otp) {
        throw new AppError(400, 'OTP required!');
    }

    const isUser = await User.findOne({ email }).select('-password -auths');
    if (!isUser) {
        throw new AppError(400, 'User not found by this email!');
    }
    // console.log("this is the otp",isUser.otp, otp)
    if (isUser.otp !== otp || otp.length < 4) {
        throw new AppError(400, 'Invalid OTP!');
    }


    const updateUser = await User.findOneAndUpdate(
        { email },
        { isVerified: true, otp: 0, $unset: { deleteAfter: '' } },
        {
            runValidators: true,
            new: true,
            projection: {
                password: 0,
                otp: 0,
                auths: 0,
                otpExpireAt: 0,
                updatedAt: 0,
                createdAt: 0,
            },
        }
    );

    return updateUser;
};

const resendOTPService = async (email: string) => {
    if (!email) {
        throw new AppError(400, 'Email required!');
    }

    const isUser = await User.findOne({ email });
    if (!isUser) {
        throw new AppError(400, 'User not found by this email!');
    }

    if (isUser.isVerified) {
        throw new AppError(400, 'User already verified!');
    }

    const generateOTP = randomOTPGenerator(1000, 9999);
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 min

    await User.findOneAndUpdate(
        { email },
        { otp: generateOTP, otpExpireAt: otpExpiry },
        {
            runValidators: true,
            new: true,
            projection: {
                password: 0,
                otp: 0,
                auths: 0,
                otpExpireAt: 0,
                updatedAt: 0,
                createdAt: 0,
            },
        }
    );

    // Send OTP to verify
    sendEmail({
        to: isUser.email,
        subject: 'User verify OTP',
        templateName: 'otp',
        templateData: {
            name: isUser.name,
            otp: generateOTP,
        },
    });

    return isUser;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    if (decodedToken.role === Role.USER) {
        if (userId !== decodedToken.userId) {
            throw new AppError(401, "You are not authorized")
        }
    }

    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if (decodedToken.role === Role.PROVIDER && ifUserExist.role === Role.SUPER_ADMIN) {
        throw new AppError(401, "You are not authorized")
    }

    if (payload.role) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
        if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.PROVIDER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized")
        }
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });

    if (payload.picture && ifUserExist.picture) {
        await deleteImageFromCLoudinary(ifUserExist.picture)
    }

    return newUpdatedUser;
}

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
const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

export const UserServices = {
    createUser,
    updateUserLocation,
    getAllUsers,
    updateUser,
    getSingleUser,
    getMe,
    verifyUserService,
    resendOTPService
}