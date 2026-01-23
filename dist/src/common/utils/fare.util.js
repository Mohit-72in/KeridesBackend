"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFare = calculateFare;
exports.formatFare = formatFare;
exports.calculateFareWithBreakdown = calculateFareWithBreakdown;
function calculateFare(input) {
    const { distanceInKm, durationInSeconds = 0, fareStructure, baseFare = 0, } = input;
    if (distanceInKm < 0) {
        throw new Error('Distance cannot be negative');
    }
    if (fareStructure.minimumFare < 0) {
        throw new Error('Minimum fare cannot be negative');
    }
    if (fareStructure.perKilometerRate < 0) {
        throw new Error('Per kilometer rate cannot be negative');
    }
    const distanceFare = distanceInKm * fareStructure.perKilometerRate;
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    const waitingChargePerMinute = fareStructure.waitingChargePerMinute || 0;
    const waitingCharge = durationInMinutes * waitingChargePerMinute;
    const totalFare = baseFare + distanceFare + waitingCharge;
    return Math.max(fareStructure.minimumFare, totalFare);
}
function formatFare(fare) {
    return fare.toFixed(2);
}
function calculateFareWithBreakdown(input) {
    const { distanceInKm, durationInSeconds = 0, fareStructure, baseFare = 0, } = input;
    const distanceFare = distanceInKm * fareStructure.perKilometerRate;
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    const waitingCharge = durationInMinutes * (fareStructure.waitingChargePerMinute || 0);
    const totalBeforeMinimum = baseFare + distanceFare + waitingCharge;
    const finalFare = Math.max(fareStructure.minimumFare, totalBeforeMinimum);
    return {
        baseFare,
        distanceFare,
        waitingCharge,
        totalBeforeMinimum,
        minimumFare: fareStructure.minimumFare,
        finalFare,
    };
}
//# sourceMappingURL=fare.util.js.map