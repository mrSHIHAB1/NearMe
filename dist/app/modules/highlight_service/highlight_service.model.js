"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightService = void 0;
const mongoose_1 = require("mongoose");
const highlightServiceSchema = new mongoose_1.Schema({
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
exports.HighlightService = (0, mongoose_1.model)("HighlightService", highlightServiceSchema);
