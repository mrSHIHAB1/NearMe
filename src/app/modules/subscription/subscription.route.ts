import express from "express";
import { SubscriptionController } from "./subscription.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { manualSubscriptionZodSchema } from "./subscription.validation";

const router = express.Router();

router.get("/my-plan", checkAuth(Role.PROVIDER), SubscriptionController.getMyCurrentSubscription);
router.get("/history", checkAuth(Role.PROVIDER), SubscriptionController.getMySubscriptionHistory);
router.post("/subscribe", checkAuth(Role.PROVIDER), SubscriptionController.subscribeToPlan);
router.post("/cancel", checkAuth(Role.PROVIDER), SubscriptionController.cancelMySubscription);

// Manual subscription creation endpoint for admin/superadmin
router.post(
  "/manual/create",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(manualSubscriptionZodSchema),
  SubscriptionController.createManualSubscription
);

export const SubscriptionRoutes = router;