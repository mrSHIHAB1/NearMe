"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAppleToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const env_1 = require("../config/env");
// Apple JWKS client
const client = (0, jwks_rsa_1.default)({
    jwksUri: "https://appleid.apple.com/auth/keys",
    timeout: 30000, // optional but recommended
});
// 🔑 Get signing key from Apple
function getKey(header, callback) {
    console.log("🔍 JWT Header:", header);
    if (!header.kid) {
        console.error("❌ Missing 'kid' in token header");
        return callback(new Error("Missing kid in token header"), null);
    }
    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            console.error("❌ JWKS Key Fetch Error:", err);
            return callback(err, null);
        }
        if (!key) {
            console.error("❌ No key returned from JWKS");
            return callback(new Error("No signing key found"), null);
        }
        const signingKey = key.getPublicKey();
        console.log("✅ Signing Key fetched successfully");
        callback(null, signingKey);
    });
}
// 🔐 Verify Apple ID Token
const verifyAppleToken = (idToken) => {
    return new Promise((resolve, reject) => {
        try {
            // 🔍 Decode without verifying (for debugging)
            const decodedPreview = jsonwebtoken_1.default.decode(idToken, { complete: true });
            console.log("🧾 Token Preview:", decodedPreview);
            jsonwebtoken_1.default.verify(idToken, getKey, {
                issuer: "https://appleid.apple.com",
                algorithms: ["RS256"],
                audience: env_1.envVars.APPLE_CLIENT_ID,
            }, (err, decoded) => {
                if (err) {
                    console.error("❌ Apple Token Verification Error:");
                    console.error("➡️ Message:", err.message);
                    console.error("➡️ Full Error:", err);
                    return reject(err);
                }
                console.log("✅ Apple Token Verified Successfully");
                console.log("📦 Decoded Payload:", decoded);
                resolve(decoded);
            });
        }
        catch (error) {
            console.error("🔥 Unexpected Error during verification:", error);
            reject(error);
        }
    });
};
exports.verifyAppleToken = verifyAppleToken;
