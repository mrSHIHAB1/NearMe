import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { StaticPageController } from "./static_pages.controller";
import {
  createAboutUsZodSchema,
  updateAboutUsZodSchema,
  createContactUsZodSchema,
  updateContactUsZodSchema,
  createHelpSupportZodSchema,
  updateHelpSupportZodSchema,
  createPrivacyPolicyZodSchema,
  updatePrivacyPolicyZodSchema,
  createTermsConditionZodSchema,
  updateTermsConditionZodSchema,
} from "./static_pages.validation";

const router = express.Router();

/* ---------------- ABOUT US ---------------- */
router.get("/about-us", StaticPageController.getAboutUs);

router.post(
  "/about-us",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(createAboutUsZodSchema),
  StaticPageController.createAboutUs
);

router.patch(
  "/about-us/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateAboutUsZodSchema),
  StaticPageController.updateAboutUs
);


/* ---------------- CONTACT US ---------------- */
router.get("/contact-us", StaticPageController.getContactUs);

router.post(
  "/contact-us",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(createContactUsZodSchema),
  StaticPageController.createContactUs
);

router.patch(
  "/contact-us/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateContactUsZodSchema),
  StaticPageController.updateContactUs
);

/* ---------------- HELP SUPPORT ---------------- */
router.get("/help-support", StaticPageController.getHelpSupport);

router.post(
  "/help-support",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(createHelpSupportZodSchema),
  StaticPageController.createHelpSupport
);

router.patch(
  "/help-support/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateHelpSupportZodSchema),
  StaticPageController.updateHelpSupport
);

/* ---------------- PRIVACY POLICY ---------------- */
router.get("/privacy-policy", StaticPageController.getPrivacyPolicy);

router.post(
  "/privacy-policy",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(createPrivacyPolicyZodSchema),
  StaticPageController.createPrivacyPolicy
);

router.patch(
  "/privacy-policy/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updatePrivacyPolicyZodSchema),
  StaticPageController.updatePrivacyPolicy
);

/* ---------------- TERMS CONDITION ---------------- */
router.get("/terms-condition", StaticPageController.getTermsCondition);

router.post(
  "/terms-condition",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(createTermsConditionZodSchema),
  StaticPageController.createTermsCondition
);

router.patch(
  "/terms-condition/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(updateTermsConditionZodSchema),
  StaticPageController.updateTermsCondition
);



export const StaticPageRoutes = router;