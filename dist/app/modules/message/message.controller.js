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
exports.messageControllers = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const message_service_1 = require("./message.service");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
// SEND DIRECT MESSAGE
const sendDirectMessage = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const { receiverId } = req.params;
    const payload = Object.assign(Object.assign({}, req.body), { image: (_a = req.file) === null || _a === void 0 ? void 0 : _a.path });
    const result = yield message_service_1.messageServices.sendDirectMessageService(user, receiverId, payload);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: 'Message sent successfully!',
        data: result,
    });
}));
// GET DIRECT MESSAGES WITH A USER
const getDirectMessages = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { userId } = req.params;
    const query = req.query;
    const result = yield message_service_1.messageServices.getDirectMessagesService(user, userId, query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Messages retrieved successfully!',
        data: result,
    });
}));
// MARK MESSAGES AS SEEN
const markMessagesAsSeen = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { userId } = req.params;
    const result = yield message_service_1.messageServices.markMessagesAsSeenService(user, userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: result.message,
        data: { count: result.count },
    });
}));
// GET ALL CONVERSATIONS
const getConversations = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield message_service_1.messageServices.getConversationsService(user);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Conversations retrieved successfully!',
        data: result,
    });
}));
exports.messageControllers = {
    sendDirectMessage,
    getDirectMessages,
    markMessagesAsSeen,
    getConversations,
};
