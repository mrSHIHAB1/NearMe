import express from "express";
import { SubscriptionController } from "./subscription.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.get("/my-plan", checkAuth(Role.PROVIDER), SubscriptionController.getMyCurrentSubscription);
router.get("/history", checkAuth(Role.PROVIDER), SubscriptionController.getMySubscriptionHistory);
router.post("/subscribe", checkAuth(Role.PROVIDER), SubscriptionController.subscribeToPlan);
router.post("/cancel", checkAuth(Role.PROVIDER), SubscriptionController.cancelMySubscription);

export const SubscriptionRoutes = router;