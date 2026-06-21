"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    parentReview: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Review",
        default: null
    },
    replies: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, {
    timestamps: true
});
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);
