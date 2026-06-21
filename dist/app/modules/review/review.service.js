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
exports.ReviewServices = void 0;
const review_model_1 = require("./review.model");
const enforceReviewReplyPermission_1 = require("../../utils/subscriptionHelper/enforceReviewReplyPermission");
const updateServiceAverageRating_1 = require("../../utils/AverageRatingHelper/updateServiceAverageRating");
const createReview = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.parentReview) {
        yield (0, enforceReviewReplyPermission_1.enforceReviewReplyPermission)(userId);
    }
    const review = yield review_model_1.Review.create(Object.assign(Object.assign({}, payload), { user: userId }));
    if (payload.parentReview) {
        yield review_model_1.Review.findByIdAndUpdate(payload.parentReview, {
            $push: { replies: review._id },
        });
    }
    else {
        // Update service average rating after creating a review
        yield (0, updateServiceAverageRating_1.updateServiceAverageRating)(review.service.toString());
    }
    return review;
});
const getRepliesRecursively = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
    const replies = yield review_model_1.Review.find({ parentReview: parentId })
        .populate("user", "name")
        .lean();
    for (const reply of replies) {
        reply.replies = yield getRepliesRecursively(reply._id.toString());
    }
    return replies;
});
const getServiceReviews = (serviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield review_model_1.Review.find({
        service: serviceId,
        parentReview: null,
    })
        .populate("user", "name")
        .lean();
    for (const review of reviews) {
        review.replies = yield getRepliesRecursively(review._id.toString());
    }
    return reviews;
});
const deleteReview = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield review_model_1.Review.findById(id);
    const deleted = yield review_model_1.Review.findByIdAndDelete(id);
    // Update service average rating after deleting a review
    if (review && !review.parentReview) {
        yield (0, updateServiceAverageRating_1.updateServiceAverageRating)(review.service.toString());
    }
    return deleted;
});
exports.ReviewServices = {
    createReview,
    getServiceReviews,
    deleteReview,
};
