"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.findDriversWithinRadius = findDriversWithinRadius;
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function findDriversWithinRadius(customerLat, customerLon, drivers, radiusKm = 5) {
    return drivers
        .filter((driver) => {
        const distance = calculateDistance(customerLat, customerLon, driver.latitude, driver.longitude);
        return distance <= radiusKm;
    })
        .map((driver) => ({
        ...driver,
        distance: calculateDistance(customerLat, customerLon, driver.latitude, driver.longitude),
    }))
        .sort((a, b) => a.distance - b.distance);
}
//# sourceMappingURL=geolocation.util.js.map