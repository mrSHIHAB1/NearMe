export const calculateDistanceInMiles = (
  userLon: number,
  userLat: number,
  serviceLon: number,
  serviceLat: number
): number => {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((serviceLat - userLat) * Math.PI) / 180;
  const dLon = ((serviceLon - userLon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLat * Math.PI) / 180) *
    Math.cos((serviceLat * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};