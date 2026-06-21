"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServiceMeta = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const calculateDistanceInMiles_1 = require("./calculateDistanceInMiles");
const checkIsAvailableNow_1 = require("./checkIsAvailableNow");
const buildServiceMeta = (service, ratingMap, userLon, userLat) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
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
        service_subCategory: (_a = service.service_subCategory) !== null && _a !== void 0 ? _a : null,
        service_childCategory: (_b = service.service_childCategory) !== null && _b !== void 0 ? _b : null,
        provider: {
            _id: (_d = (_c = service.provider) === null || _c === void 0 ? void 0 : _c._id) !== null && _d !== void 0 ? _d : null,
            name: (_f = (_e = service.provider) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : null,
            planName: (_j = (_h = (_g = service.provider) === null || _g === void 0 ? void 0 : _g.subscriptionInfo) === null || _h === void 0 ? void 0 : _h.planName) !== null && _j !== void 0 ? _j : "free",
            badgeType: (_m = (_l = (_k = service.provider) === null || _k === void 0 ? void 0 : _k.subscriptionInfo) === null || _l === void 0 ? void 0 : _l.badgeType) !== null && _m !== void 0 ? _m : "none",
            priorityScore: (_q = (_p = (_o = service.provider) === null || _o === void 0 ? void 0 : _o.subscriptionInfo) === null || _p === void 0 ? void 0 : _p.priorityScore) !== null && _q !== void 0 ? _q : 0,
        },
        averageRating: ratingData
            ? parseFloat(ratingData.averageRating.toFixed(1))
            : ((_r = service.averageRating) !== null && _r !== void 0 ? _r : 0),
        totalReviews: (_s = ratingData === null || ratingData === void 0 ? void 0 : ratingData.totalReviews) !== null && _s !== void 0 ? _s : 0,
        distanceInMiles: (0, calculateDistanceInMiles_1.calculateDistanceInMiles)(userLon, userLat, serviceLon, serviceLat),
        isAvailableNow: (0, checkIsAvailableNow_1.checkIsAvailableNow)(service.openingTime, service.closingTime, service.allTimeAvailability),
    };
};
exports.buildServiceMeta = buildServiceMeta;
