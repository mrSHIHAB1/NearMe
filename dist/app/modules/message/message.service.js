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
exports.messageServices = void 0;
const message_model_1 = __importDefault(require("./message.model"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const message_interface_1 = require("./message.interface");
const socket_1 = require("../../socket");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const user_model_1 = require("../user/user.model");
const user_notification_utils_1 = require("../../utils/notificationSendHelper/user.notification.utils");
const push_notification_utils_1 = require("../../utils/notificationSendHelper/push.notification.utils");
const notification_interface_1 = require("../notification/notification.interface");
// SEND DIRECT MESSAGE (1-to-1)
const sendDirectMessageService = (user, receiverId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = user.userId;
    // Check if receiver exists
    const receiver = yield user_model_1.User.findById(receiverId);
    if (!receiver) {
        (0, cloudinary_config_1.deleteImageFromCLoudinary)(payload.image || '');
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Receiver not found!');
    }
    // Check if sender exists
    const sender = yield user_model_1.User.findById(senderId);
    if (!sender) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Sender not found!');
    }
    // Validate message content
    if (!payload.text && !payload.image) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Message must contain text or image!');
    }
    // If replyTo is provided, verify it exists
    if (payload.replyTo) {
        const replyMessage = yield message_model_1.default.findById(payload.replyTo);
        if (!replyMessage) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Reply message not found!');
        }
    }
    // Create message
    const message = yield message_model_1.default.create({
        sender: senderId,
        receiver: receiverId,
        message: {
            text: payload.text || '',
            image: payload.image || '',
        },
        status: message_interface_1.MessageStatus.SENT,
        replyTo: payload.replyTo,
    });
    // Populate sender and replyTo details before emitting so clients receive
    // the populated fields (name, picture, reply info)
    yield message.populate([
        { path: 'sender', select: 'name picture' },
        { path: 'replyTo', select: 'message sender' },
    ]);
    // Emit to rooms named by userId (sockets join a room with their userId)
    socket_1.io.to(receiverId).emit('direct_message', message);
    // avoid sending twice to the same room when sender === receiver
    if (senderId !== receiverId) {
        socket_1.io.to(senderId).emit('direct_message', message);
    }
    const notificationPayload = {
        user: new mongoose_1.Types.ObjectId(receiverId),
        type: notification_interface_1.NotificationType.CHAT,
        title: 'New Message',
        description: `${sender.name} sent you a message`,
        chatId: message._id,
        data: {
            senderId: sender === null || sender === void 0 ? void 0 : sender._id.toString(),
            senderName: sender === null || sender === void 0 ? void 0 : sender.name,
            receiverId: receiverId,
            message: message.message.text || message.message.image,
            image: sender === null || sender === void 0 ? void 0 : sender.picture,
        },
    };
    // Send real-time notification via socket if receiver is online
    try {
        if (socket_1.onlineUsers[receiverId]) {
            console.log('🟢 [MESSAGE SERVICE] Receiver is ONLINE - sending socket notification');
            yield (0, user_notification_utils_1.sendPersonalNotification)(notificationPayload);
        }
        else {
            console.log('🔴 [MESSAGE SERVICE] Receiver is OFFLINE - sending push notification');
            yield (0, push_notification_utils_1.sendPushAndSave)(notificationPayload);
        }
    }
    catch (notificationError) {
        console.error('⚠️ [MESSAGE SERVICE] Notification sending failed (non-critical):', notificationError instanceof Error ? notificationError.message : String(notificationError));
        // Don't rethrow - message was already saved successfully
    }
    return message;
});
// GET DIRECT MESSAGES BETWEEN TWO USERS
const getDirectMessagesService = (user, otherUserId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.userId;
    // Check if other user exists
    const otherUser = yield user_model_1.User.findById(otherUserId);
    if (!otherUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found!');
    }
    const sort = query.sort || 'createdAt'; // Default: oldest first for chat
    // Build filter conditions - only direct messages between two users
    // Messages must have sender AND receiver (no group field)
    const filterConditions = {
        $and: [
            {
                $or: [
                    { sender: userId, receiver: otherUserId },
                    { sender: otherUserId, receiver: userId },
                ],
            },
            { sender: { $exists: true } }, // Must have sender
            { receiver: { $exists: true } }, // Must have receiver (excludes group messages)
        ],
    };
    // Fetch messages without pagination
    const messages = yield message_model_1.default.find(filterConditions)
        .sort(sort)
        .populate('sender', 'name picture')
        .populate('receiver', 'name picture')
        .populate({
        path: 'replyTo',
        select: 'message sender',
        populate: { path: 'sender', select: 'name' },
    });
    // Mark messages from other user as DELIVERED if they were SENT
    yield message_model_1.default.updateMany({
        sender: otherUserId,
        receiver: userId,
        status: message_interface_1.MessageStatus.SENT,
    }, { status: message_interface_1.MessageStatus.DELIVERED });
    return messages;
});
// MARK MESSAGES AS SEEN
const markMessagesAsSeenService = (user, otherUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.userId;
    // Check if other user exists
    const otherUser = yield user_model_1.User.findById(otherUserId);
    if (!otherUser) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'User not found!');
    }
    // Update all messages from otherUser to current user as SEEN
    const result = yield message_model_1.default.updateMany({
        sender: otherUserId,
        receiver: userId,
        status: { $in: [message_interface_1.MessageStatus.SENT, message_interface_1.MessageStatus.DELIVERED] },
    }, { status: message_interface_1.MessageStatus.SEEN });
    // Notify sender via socket that messages have been seen. Emit to the
    // user's room so all connected devices receive the update.
    if (socket_1.onlineUsers[otherUserId]) {
        socket_1.io.to(otherUserId).emit('messages_seen', {
            userId: userId,
            count: result.modifiedCount,
        });
    }
    return { message: 'Messages marked as seen!', count: result.modifiedCount };
});
// GET ALL CONVERSATIONS (List of users with whom current user has chatted)
const getConversationsService = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = user.userId;
    // Find all unique users the current user has messaged or received messages from
    const messages = yield message_model_1.default.aggregate([
        {
            $match: {
                $or: [
                    { sender: new mongoose_1.Types.ObjectId(userId) },
                    { receiver: new mongoose_1.Types.ObjectId(userId) },
                ],
                group: { $exists: false }, // Exclude group messages
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $eq: ['$sender', new mongoose_1.Types.ObjectId(userId)] },
                        '$receiver',
                        '$sender',
                    ],
                },
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$receiver', new mongoose_1.Types.ObjectId(userId)] },
                                    { $ne: ['$status', message_interface_1.MessageStatus.SEEN] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        {
            $unwind: '$user',
        },
        {
            $project: {
                user: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    picture: 1,
                },
                lastMessage: 1,
                unreadCount: 1,
            },
        },
        {
            $sort: { 'lastMessage.createdAt': -1 },
        },
    ]);
    return messages;
});
exports.messageServices = {
    sendDirectMessageService,
    getDirectMessagesService,
    markMessagesAsSeenService,
    getConversationsService,
};
