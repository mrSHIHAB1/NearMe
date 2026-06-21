"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const validateRequest_1 = require("../../middlewares/validateRequest");
const multer_config_1 = require("../../config/multer.config");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const message_validation_1 = require("./message.validation");
const router = express_1.default.Router();
// Get all conversations (list of users with last message)
router.get('/conversations', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), message_controller_1.messageControllers.getConversations);
// Send direct message to a user
router.post('/send/:receiverId', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), multer_config_1.multerUpload.single('file'), (0, validateRequest_1.validateRequest)(message_validation_1.sendMessageSchema), message_controller_1.messageControllers.sendDirectMessage);
// Get all messages with a specific user
router.get('/:userId', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), message_controller_1.messageControllers.getDirectMessages);
// Mark messages as seen
router.patch('/:userId/seen', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), message_controller_1.messageControllers.markMessagesAsSeen);
exports.MessageRoutes = router;
