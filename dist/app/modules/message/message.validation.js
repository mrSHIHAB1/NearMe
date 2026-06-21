"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageSchema = void 0;
const zod_1 = require("zod");
// Validation schema for sending a message
exports.sendMessageSchema = zod_1.z.object({
    text: zod_1.z.string().optional(),
    replyTo: zod_1.z.string().optional(),
});
