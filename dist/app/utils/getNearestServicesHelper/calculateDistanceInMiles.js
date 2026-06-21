"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistanceInMiles = void 0;
const calculateDistanceInMiles = (userLon, userLat, serviceLon, serviceLat) => {
    const R = 3958.8; // Earth radius in miles
    const dLat = ((serviceLat - userLat) * Math.PI) / 180;
    const dLon = ((serviceLon - userLon) * Math.PI) / 180;
    const a = Math.pow(Math.sin(dLat / 2), 2) +
        Math.cos((userLat * Math.PI) / 180) *
            Math.cos((serviceLat * Math.PI) / 180) *
            Math.pow(Math.sin(dLon / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
};
exports.calculateDistanceInMiles = calculateDistanceInMiles;
