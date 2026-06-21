"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    image: { type: String, required: false },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    level: {
        type: Number,
        enum: [0, 1, 2],
        required: true,
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: true, // admin created = auto approved
    },
}, { timestamps: true });
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
