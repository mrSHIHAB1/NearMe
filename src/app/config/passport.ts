/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from 'bcryptjs';

const parseGoogleState = (state?: string) => {
    const params = new URLSearchParams(state || "");
    const redirect = params.get("redirect") || "/";
    const role = params.get("role") || undefined;
    return { redirect, role };
};

passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email });

            // if (!isUserExist) {
            //     return done(null, false, { message: "User does not exists" })
            // }

            if (!isUserExist) {
                return done("User does not exists")
            }

            if ( isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
                return done(`User is ${isUserExist.isActive}`)
            }

            if (isUserExist.isDeleted) {
                return done("User is deleted")
            }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google")

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." })
            }

            // if (isGoogleAuthenticated ) {
            //     return done("You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." )
            // }

            const IsPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!IsPasswordMatched) {
                return done(null, false, { message: "Password does not matched" })
            }

            return done(null, isUserExist)
        } catch (error) {
            console.log(error);
            done(error)
        }
    })
)

passport.use(new GoogleStrategy({
    clientID: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: envVars.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0].value;
        const stateValue = typeof req?.query?.state === "string" ? req.query.state : "";
        const { role: roleParam } = parseGoogleState(stateValue);
        if (roleParam && !Object.values(Role).includes(roleParam as Role)) {
            return done(null, false, { message: "Invalid role parameter" });
        }
        const resolvedRole = roleParam ? (roleParam as Role) : Role.USER;

        if (!email) {
            return done(null, false, { message: "No email found" });
        }

        let isUserExist = await User.findOne({ email })
        if (isUserExist && roleParam && isUserExist.role !== resolvedRole) {
            return done(null, false, { message: "Role mismatch for this account" })
        }
        if (isUserExist && !isUserExist.isVerified) {
            // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
            // done("User is not verified")
            return done(null, false, { message: "User is not verified" })
        }

        if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
            // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
            done(`User is ${isUserExist.isActive}`)
        }

        if (isUserExist && isUserExist.isDeleted) {
            return done(null, false, { message: "User is deleted" })
            // done("User is deleted")
        }

        if (!isUserExist) {
            isUserExist = await User.create({
                email,
                name: profile.displayName,
                picture: profile.photos?.[0].value,
                role: resolvedRole,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            })
        }
        return done(null, isUserExist)
    } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
    }
}))

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error);
    }
})