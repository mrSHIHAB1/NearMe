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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const payment_service_1 = require("./payment.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const payment_model_1 = __importDefault(require("./payment.model"));
const verifyPurchase = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield payment_service_1.PaymentService.verifyPurchase(Object.assign(Object.assign({}, req.body), { userId }));
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Subscription verified successfully",
        data: result,
    });
}));
const appleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield payment_service_1.PaymentService.handleAppleWebhook(req);
        res.status(200).json({
            success: true,
            message: "Webhook processed",
            data: result,
        });
    }
    catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
});
const googleWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield payment_service_1.PaymentService.handleGoogleWebhook(req);
        res.status(200).json({
            success: true,
            message: "Webhook processed",
            data: result,
        });
    }
    catch (error) {
        console.error("Google webhook error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong",
        });
    }
});
/**
 * Get payment transaction history for the authenticated user
 */
const getTransactionHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { limit = 50, skip = 0, type, status } = req.query;
    const filter = { userId: id };
    if (type) {
        filter.transactionType = type;
    }
    if (status) {
        filter.status = status;
    }
    const transactions = yield payment_model_1.default.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(skip));
    const total = yield payment_model_1.default.countDocuments(filter);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Payment transaction history retrieved",
        data: {
            transactions,
            pagination: {
                total,
                limit: Number(limit),
                skip: Number(skip),
            },
        },
    });
}));
/**
 * Get payment summary for the authenticated user
 */
const getPaymentSummary = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.user;
    const totalSpent = yield payment_model_1.default.aggregate([
        {
            $match: {
                userId: id,
                status: "COMPLETED",
                transactionType: { $in: ["PURCHASE", "RENEWAL"] },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);
    const transactionsByType = yield payment_model_1.default.aggregate([
        {
            $match: { userId: id },
        },
        {
            $group: {
                _id: "$transactionType",
                count: { $sum: 1 },
            },
        },
    ]);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Payment summary retrieved",
        data: {
            totalSpent: ((_a = totalSpent[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            transactionCount: ((_b = totalSpent[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
            transactionsByType,
        },
    });
}));
exports.PaymentController = {
    verifyPurchase,
    appleWebhook,
    googleWebhook,
    getTransactionHistory,
    getPaymentSummary,
};
