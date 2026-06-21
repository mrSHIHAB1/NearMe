"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const env_1 = require("./env");
const serviceAccountData = {
    type: env_1.envVars.TYPE,
    project_id: env_1.envVars.PROJECT_ID,
    private_key_id: env_1.envVars.PRIVATE_KEY_ID,
    private_key: (_a = env_1.envVars.PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
    client_email: env_1.envVars.CLIENT_EMAIL,
    client_id: env_1.envVars.CLIENT_ID,
    auth_uri: env_1.envVars.AUTH_URI,
    token_uri: env_1.envVars.TOKEN_URI,
    auth_provider_x509_cert_url: env_1.envVars.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: env_1.envVars.CLIENT_X509_CERT_URL,
    universe_domain: env_1.envVars.UNIVERSE_DOMAIN,
};
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccountData),
});
exports.default = firebase_admin_1.default;
