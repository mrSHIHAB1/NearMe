/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateDistanceInMiles } from "./calculateDistanceInMiles";
import { checkIsAvailableNow } from "./checkIsAvailableNow";

export const buildServiceMeta = (
  service: any,
  ratingMap: Map<string, any>,
  userLon: number,
  userLat: number
) => {
  const [serviceLon, serviceLat] = service.location.coordinates;
  const ratingData = ratingMap.get(service._id.toString());

  return {
    _id: service._id,
    service_name: service.service_name,
    company_logo: service.company_logo,
    coordinates: service.location.coordinates,
    openingTime: service.openingTime,
    closingTime: service.closingTime,
    allTimeAvailability: service.allTimeAvailability,
    service_address: service.service_address,
    provider: {
      planName: service.provider?.subscriptionInfo?.planName ?? "free",
      badgeType: service.provider?.subscriptionInfo?.badgeType ?? "none",
      priorityScore: service.provider?.subscriptionInfo?.priorityScore ?? 0,
    },
    averageRating: ratingData
      ? parseFloat(ratingData.averageRating.toFixed(1))
      : 0,
    totalReviews: ratingData?.totalReviews ?? 0,
    distanceInMiles: calculateDistanceInMiles(
      userLon,
      userLat,
      serviceLon,
      serviceLat
    ),
    isAvailableNow: checkIsAvailableNow(
      service.openingTime,
      service.closingTime,
      service.allTimeAvailability
    ),
  };
};