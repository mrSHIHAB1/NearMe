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
/* eslint-disable @typescript-eslint/no-explicit-any */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const parseGoogleState = (state) => {
    const params = new URLSearchParams(state || "");
    const redirect = params.get("redirect") || "/";
    const role = params.get("role") || undefined;
    return { redirect, role };
};
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.User.findOne({ email });
        // if (!isUserExist) {
        //     return done(null, false, { message: "User does not exists" })
        // }
        if (!isUserExist) {
            return done("User does not exists");
        }
        if (isUserExist && (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE)) {
            return done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
            return done("User is deleted");
        }
        const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider == "google");
        if (isGoogleAuthenticated && !isUserExist.password) {
            return done(null, false, { message: "You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." });
        }
        // if (isGoogleAuthenticated ) {
        //     return done("You have authenticated through Google. So if you want to login with credentials, then at first login with google and set a password for your Gmail and then you can login with email and password." )
        // }
        const IsPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
        if (!IsPasswordMatched) {
            return done(null, false, { message: "Password does not matched" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
})));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        const stateValue = typeof ((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.state) === "string" ? req.query.state : "";
        const { role: roleParam } = parseGoogleState(stateValue);
        if (roleParam && !Object.values(user_interface_1.Role).includes(roleParam)) {
            return done(null, false, { message: "Invalid role parameter" });
        }
        const resolvedRole = roleParam ? roleParam : user_interface_1.Role.USER;
        if (!email) {
            return done(null, false, { message: "No email found" });
        }
        let isUserExist = yield user_model_1.User.findOne({ email });
        if (isUserExist && roleParam && isUserExist.role !== resolvedRole) {
            return done(null, false, { message: "Role mismatch for this account" });
        }
        if (isUserExist && !isUserExist.isVerified) {
            // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
            // done("User is not verified")
            return done(null, false, { message: "User is not verified" });
        }
        if (isUserExist && (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE)) {
            // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
            done(`User is ${isUserExist.isActive}`);
        }
        if (isUserExist && isUserExist.isDeleted) {
            return done(null, false, { message: "User is deleted" });
            // done("User is deleted")
        }
        if (!isUserExist) {
            isUserExist = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value,
                role: resolvedRole,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        console.log(error);
        done(error);
    }
}));
