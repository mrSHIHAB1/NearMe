"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGeoQuery = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const buildGeoQuery = (userLon, userLat, radiusInMeters, categories) => {
    const query = {
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
exports.buildGeoQuery = buildGeoQuery;
