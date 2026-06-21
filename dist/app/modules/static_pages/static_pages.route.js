"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticPageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_interface_1 = require("../user/user.interface");
const static_pages_controller_1 = require("./static_pages.controller");
const static_pages_validation_1 = require("./static_pages.validation");
const router = express_1.default.Router();
/* ---------------- ABOUT US ---------------- */
router.get("/about-us", static_pages_controller_1.StaticPageController.getAboutUs);
router.post("/about-us", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.createAboutUsZodSchema), static_pages_controller_1.StaticPageController.createAboutUs);
router.patch("/about-us/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.updateAboutUsZodSchema), static_pages_controller_1.StaticPageController.updateAboutUs);
/* ---------------- CONTACT US ---------------- */
router.get("/contact-us", static_pages_controller_1.StaticPageController.getContactUs);
router.post("/contact-us", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.createContactUsZodSchema), static_pages_controller_1.StaticPageController.createContactUs);
router.patch("/contact-us/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.updateContactUsZodSchema), static_pages_controller_1.StaticPageController.updateContactUs);
/* ---------------- HELP SUPPORT ---------------- */
router.get("/help-support", static_pages_controller_1.StaticPageController.getHelpSupport);
router.post("/help-support", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.createHelpSupportZodSchema), static_pages_controller_1.StaticPageController.createHelpSupport);
router.patch("/help-support/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.updateHelpSupportZodSchema), static_pages_controller_1.StaticPageController.updateHelpSupport);
/* ---------------- PRIVACY POLICY ---------------- */
router.get("/privacy-policy", static_pages_controller_1.StaticPageController.getPrivacyPolicy);
router.post("/privacy-policy", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.createPrivacyPolicyZodSchema), static_pages_controller_1.StaticPageController.createPrivacyPolicy);
router.patch("/privacy-policy/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.updatePrivacyPolicyZodSchema), static_pages_controller_1.StaticPageController.updatePrivacyPolicy);
/* ---------------- TERMS CONDITION ---------------- */
router.get("/terms-condition", static_pages_controller_1.StaticPageController.getTermsCondition);
router.post("/terms-condition", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.createTermsConditionZodSchema), static_pages_controller_1.StaticPageController.createTermsCondition);
router.patch("/terms-condition/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(static_pages_validation_1.updateTermsConditionZodSchema), static_pages_controller_1.StaticPageController.updateTermsCondition);
exports.StaticPageRoutes = router;
