"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const message_interface_1 = require("./message.interface");
const messageSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    // group: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Group',
    // },
    message: { type: { text: String, image: String }, _id: false },
    status: {
        type: String,
        enum: [...Object.keys(message_interface_1.MessageStatus)],
        default: message_interface_1.MessageStatus.SENT,
    },
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {
    timestamps: true,
    versionKey: false,
});
const Message = (0, mongoose_1.model)('message', messageSchema);
exports.default = Message;
