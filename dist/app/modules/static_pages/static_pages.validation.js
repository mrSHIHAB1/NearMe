"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTermsConditionZodSchema = exports.createTermsConditionZodSchema = exports.updatePrivacyPolicyZodSchema = exports.createPrivacyPolicyZodSchema = exports.updateHelpSupportZodSchema = exports.createHelpSupportZodSchema = exports.updateContactUsZodSchema = exports.createContactUsZodSchema = exports.updateAboutUsZodSchema = exports.createAboutUsZodSchema = void 0;
const zod_1 = require("zod");
/* ---------------- ABOUT US ---------------- */
exports.createAboutUsZodSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, "About must be written")
});
exports.updateAboutUsZodSchema = exports.createAboutUsZodSchema;
/* ---------------- CONTACT US ---------------- */
exports.createContactUsZodSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    phone: zod_1.z.string().min(5, "Phone is required"),
    address: zod_1.z.string().min(1, "Address is required"),
});
exports.updateContactUsZodSchema = exports.createContactUsZodSchema;
/* ---------------- HELP SUPPORT ---------------- */
exports.createHelpSupportZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Help Support content is required"),
});
exports.updateHelpSupportZodSchema = exports.createHelpSupportZodSchema;
/* ---------------- PRIVACY POLICY ---------------- */
exports.createPrivacyPolicyZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Privacy Policy content is required"),
});
exports.updatePrivacyPolicyZodSchema = exports.createPrivacyPolicyZodSchema;
/* ---------------- TERMS CONDITION ---------------- */
exports.createTermsConditionZodSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Terms & Condition content is required"),
});
exports.updateTermsConditionZodSchema = exports.createTermsConditionZodSchema;
