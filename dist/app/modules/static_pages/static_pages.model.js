"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsCondition = exports.PrivacyPolicy = exports.HelpSupport = exports.ContactUs = exports.AboutUs = void 0;
const mongoose_1 = require("mongoose");
const aboutUsSchema = new mongoose_1.Schema({
    name: {
        type: String
    }
}, { timestamps: true });
exports.AboutUs = (0, mongoose_1.model)("AboutUs", aboutUsSchema);
const contactUsSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
}, { timestamps: true });
exports.ContactUs = (0, mongoose_1.model)("ContactUs", contactUsSchema);
const helpSupportSchema = new mongoose_1.Schema({
    name: {
        type: String
    }
}, { timestamps: true });
exports.HelpSupport = (0, mongoose_1.model)("HelpSupport", helpSupportSchema);
const privacyPolicySchema = new mongoose_1.Schema({
    name: {
        type: String
    }
}, { timestamps: true });
exports.PrivacyPolicy = (0, mongoose_1.model)("PrivacyPolicy", privacyPolicySchema);
const termsConditionSchema = new mongoose_1.Schema({
    name: {
        type: String
    }
}, { timestamps: true });
exports.TermsCondition = (0, mongoose_1.model)("TermsCondition", termsConditionSchema);
