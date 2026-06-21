"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.post("/verify-purchase", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), payment_controller_1.PaymentController.verifyPurchase);
router.post("/apple-webhook", payment_controller_1.PaymentController.appleWebhook);
router.post("/google-webhook", payment_controller_1.PaymentController.googleWebhook);
//  Get transaction history for user
router.get("/transaction-history", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), payment_controller_1.PaymentController.getTransactionHistory);
// Get payment summary for user
router.get("/payment-summary", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), payment_controller_1.PaymentController.getPaymentSummary);
exports.PaymentRoutes = router;
