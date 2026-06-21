"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsAvailableNow = void 0;
const checkIsAvailableNow = (openingTime, // "09:00"
closingTime, // "21:00"
allTimeAvailability) => {
    if (allTimeAvailability)
        return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    // Handle overnight services e.g. 22:00 → 06:00
    if (closeMinutes < openMinutes) {
        return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
    }
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};
exports.checkIsAvailableNow = checkIsAvailableNow;
