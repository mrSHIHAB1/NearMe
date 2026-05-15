/* eslint-disable @typescript-eslint/no-explicit-any */
export const buildGeoQuery = (
  userLon: number,
  userLat: number,
  radiusInMeters: number,
  categories?: string | string[]
) => {
  const query: any = {
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [userLon, userLat] },
        $maxDistance: radiusInMeters,
      },
    },
  };

  if (categories) {
    const categoryArray = Array.isArray(categories) ? categories : [categories];
    if (categoryArray.length > 0) {
      query.service_category = { $in: categoryArray };
    }
  }

  return query;
};