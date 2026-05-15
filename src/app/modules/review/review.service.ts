/* eslint-disable @typescript-eslint/no-explicit-any */
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { enforceReviewReplyPermission } from "../../utils/subscriptionHelper/enforceReviewReplyPermission";
import { updateServiceAverageRating } from "../../utils/AverageRatingHelper/updateServiceAverageRating";


const createReview = async (payload: IReview, userId: string) => {
  if (payload.parentReview) {
    await enforceReviewReplyPermission(userId);
  }

  const review = await Review.create({
    ...payload,
    user: userId,
  });

  if (payload.parentReview) {
    await Review.findByIdAndUpdate(payload.parentReview, {
      $push: { replies: review._id },
    });
  } else {
    // Update service average rating after creating a review
    await updateServiceAverageRating(review.service.toString());
  }

  return review;
};

const getRepliesRecursively = async (parentId: string): Promise<any[]> => {
  const replies = await Review.find({ parentReview: parentId })
    .populate("user", "name")
    .lean();

  for (const reply of replies) {
    reply.replies = await getRepliesRecursively(reply._id.toString());
  }

  return replies;
};

const getServiceReviews = async (serviceId: string) => {
  const reviews = await Review.find({
    service: serviceId,
    parentReview: null,
  })
    .populate("user", "name")
    .lean();

  for (const review of reviews) {
    review.replies = await getRepliesRecursively(review._id.toString());
  }

  return reviews;
};

const deleteReview = async (id: string) => {
  const review = await Review.findById(id);
  const deleted = await Review.findByIdAndDelete(id);
  
  // Update service average rating after deleting a review
  if (review && !review.parentReview) {
    await updateServiceAverageRating(review.service.toString());
  }
  
  return deleted;
};

export const ReviewServices = {
  createReview,
  getServiceReviews,
  deleteReview,
};