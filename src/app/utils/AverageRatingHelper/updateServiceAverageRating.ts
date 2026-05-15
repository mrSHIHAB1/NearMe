import { Review } from "../../modules/review/review.model";
import { Service } from "../../modules/service/service.model";

// ─── Update service average rating ────────────────────────────────────────────
export const updateServiceAverageRating = async (serviceId: string) => {
  const ratingAggregates = await Review.aggregate([
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
    const averageRating = parseFloat(
      ratingAggregates[0].averageRating.toFixed(1)
    );
    await Service.findByIdAndUpdate(serviceId, { averageRating });
  } else {
    // No ratings yet, reset to 0
    await Service.findByIdAndUpdate(serviceId, { averageRating: 0 });
  }
};