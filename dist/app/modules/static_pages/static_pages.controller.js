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
exports.StaticPageController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const static_pages_service_1 = require("./static_pages.service");
/* ---------------- ABOUT US ---------------- */
const createAboutUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.createAboutUs(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "About Us created successfully!",
        data: result,
    });
}));
const getAboutUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.getAboutUs();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us retrieved successfully!",
        data: result,
    });
}));
const updateAboutUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.updateAboutUs(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us updated successfully!",
        data: result,
    });
}));
/* ---------------- CONTACT US ---------------- */
const createContactUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.createContactUs(req.body);
    // console.log("i am from controller", req.body)
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Contact Us created successfully!",
        data: result,
    });
}));
const getContactUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.getContactUs();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Contact Us retrieved successfully!",
        data: result,
    });
}));
const updateContactUs = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.updateContactUs(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Contact Us updated successfully!",
        data: result,
    });
}));
/* ---------------- HELP SUPPORT ---------------- */
const createHelpSupport = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.createAboutUs(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "About Us created successfully!",
        data: result,
    });
}));
const getHelpSupport = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.getAboutUs();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us retrieved successfully!",
        data: result,
    });
}));
const updateHelpSupport = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.updateAboutUs(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us updated successfully!",
        data: result,
    });
}));
/* ---------------- PRIVACY POLICY ---------------- */
const createPrivacyPolicy = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.createAboutUs(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "About Us created successfully!",
        data: result,
    });
}));
const getPrivacyPolicy = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.getAboutUs();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us retrieved successfully!",
        data: result,
    });
}));
const updatePrivacyPolicy = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.updateAboutUs(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us updated successfully!",
        data: result,
    });
}));
/* ---------------- TERMS CONDITION ---------------- */
const createTermsCondition = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.createAboutUs(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "About Us created successfully!",
        data: result,
    });
}));
const getTermsCondition = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.getAboutUs();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us retrieved successfully!",
        data: result,
    });
}));
const updateTermsCondition = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield static_pages_service_1.StaticPageService.updateAboutUs(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "About Us updated successfully!",
        data: result,
    });
}));
/* ---------------- EXPORT ---------------- */
exports.StaticPageController = {
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
    updateTermsCondition
};
