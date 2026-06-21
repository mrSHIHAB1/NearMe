"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const subscription_controller_1 = require("./subscription.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const subscription_validation_1 = require("./subscription.validation");
const router = express_1.default.Router();
router.get("/my-plan", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), subscription_controller_1.SubscriptionController.getMyCurrentSubscription);
router.get("/history", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), subscription_controller_1.SubscriptionController.getMySubscriptionHistory);
router.post("/subscribe", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), subscription_controller_1.SubscriptionController.subscribeToPlan);
router.post("/cancel", (0, checkAuth_1.checkAuth)(user_interface_1.Role.PROVIDER), subscription_controller_1.SubscriptionController.cancelMySubscription);
// Manual subscription creation endpoint for admin/superadmin
router.post("/manual/create", (0, checkAuth_1.checkAuth)(user_interface_1.Role.SUPER_ADMIN), (0, validateRequest_1.validateRequest)(subscription_validation_1.manualSubscriptionZodSchema), subscription_controller_1.SubscriptionController.createManualSubscription);
exports.SubscriptionRoutes = router;
