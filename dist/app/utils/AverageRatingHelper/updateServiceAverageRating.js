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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceAverageRating = void 0;
const review_model_1 = require("../../modules/review/review.model");
const service_model_1 = require("../../modules/service/service.model");
// ─── Update service average rating ────────────────────────────────────────────
const updateServiceAverageRating = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const ratingAggregates = yield review_model_1.Review.aggregate([
        {
            $match: {
                service: serviceId,
                parentReview: null,
                rating: { $exists: true, $ne: null },
            },
        },
        {
            $group: {
                _id: "$service",
                averageRating: { $avg: "$rating" },
            },
        },
    ]);
    if (ratingAggregates.length > 0) {
        const averageRating = parseFloat(ratingAggregates[0].averageRating.toFixed(1));
        yield service_model_1.Service.findByIdAndUpdate(serviceId, { averageRating });
    }
    else {
        // No ratings yet, reset to 0
        yield service_model_1.Service.findByIdAndUpdate(serviceId, { averageRating: 0 });
    }
});
exports.updateServiceAverageRating = updateServiceAverageRating;
