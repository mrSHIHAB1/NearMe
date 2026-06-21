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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticPageService = void 0;
const static_pages_model_1 = require("./static_pages.model");
/* ---------------- ABOUT US ---------------- */
const createAboutUs = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.AboutUs.create(payload);
});
const getAboutUs = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.AboutUs.findOne().sort({ createdAt: -1 });
});
const updateAboutUs = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.AboutUs.findByIdAndUpdate(id, payload, { new: true });
});
/* ---------------- CONTACT US ---------------- */
const createContactUs = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.ContactUs.create(payload);
});
const getContactUs = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.ContactUs.findOne().sort({ createdAt: -1 });
});
const updateContactUs = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.ContactUs.findByIdAndUpdate(id, payload, { new: true });
});
/* ---------------- HELP SUPPORT ---------------- */
const createHelpSupport = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.HelpSupport.create(payload);
});
const getHelpSupport = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.HelpSupport.findOne().sort({ createdAt: -1 });
});
const updateHelpSupport = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.HelpSupport.findByIdAndUpdate(id, payload, { new: true });
});
/* ---------------- PRIVACY POLICY ---------------- */
const createPrivacyPolicy = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.PrivacyPolicy.create(payload);
});
const getPrivacyPolicy = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.PrivacyPolicy.findOne().sort({ createdAt: -1 });
});
const updatePrivacyPolicy = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.PrivacyPolicy.findByIdAndUpdate(id, payload, { new: true });
});
/* ---------------- TERMS CONDITION ---------------- */
const createTermsCondition = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.TermsCondition.create(payload);
});
const getTermsCondition = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.TermsCondition.findOne().sort({ createdAt: -1 });
});
const updateTermsCondition = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield static_pages_model_1.TermsCondition.findByIdAndUpdate(id, payload, { new: true });
});
exports.StaticPageService = {
    createAboutUs,
    getAboutUs,
    updateAboutUs,
    createContactUs,
    getContactUs,
    updateContactUs,
    createHelpSupport,
    getHelpSupport,
    updateHelpSupport,
    createPrivacyPolicy,
    getPrivacyPolicy,
    updatePrivacyPolicy,
    createTermsCondition,
    getTermsCondition,
    updateTermsCondition,
};
