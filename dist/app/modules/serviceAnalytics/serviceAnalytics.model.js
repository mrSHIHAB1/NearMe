"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceAnalytics = void 0;
const mongoose_1 = require("mongoose");
const serviceAnalyticsSchema = new mongoose_1.Schema({
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
        index: true,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String,
        enum: ['view', 'impression'],
        required: true,
        index: true,
    },
}, { timestamps: true });
serviceAnalyticsSchema.index({ service: 1, type: 1 });
serviceAnalyticsSchema.index({ service: 1, type: 1, createdAt: -1 });
exports.ServiceAnalytics = (0, mongoose_1.model)('ServiceAnalytics', serviceAnalyticsSchema);
