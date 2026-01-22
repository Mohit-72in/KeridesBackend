/**
 * Fare Calculation Utility
 * Calculates fare based on distance, duration, and vehicle's fare structure
 */

export interface FareStructure {
    minimumFare: number;
    perKilometerRate: number;
    waitingChargePerMinute?: number;
}

export interface FareCalculationInput {
    distanceInKm: number;
    durationInSeconds?: number;
    fareStructure: FareStructure;
    baseFare?: number;
}

/**
 * Calculate fare based on distance and vehicle's fare structure
 * Formula: max(minimumFare, baseFare + (distanceInKm * perKilometerRate) + waitingCharges)
 *
 * @param input - Fare calculation input containing distance, duration, and fare structure
 * @returns Calculated fare amount
 *
 * @example
 * const fare = calculateFare({
 *   distanceInKm: 5,
 *   fareStructure: {
 *     minimumFare: 50,
 *     perKilometerRate: 15,
 *     waitingChargePerMinute: 1
 *   }
 * });
 * // Returns: max(50, 0 + (5 * 15) + 0) = 75
 */
export function calculateFare(input: FareCalculationInput): number {
    const {
        distanceInKm,
        durationInSeconds = 0,
        fareStructure,
        baseFare = 0,
    } = input;

    // Validate inputs
    if (distanceInKm < 0) {
        throw new Error('Distance cannot be negative');
    }

    if (fareStructure.minimumFare < 0) {
        throw new Error('Minimum fare cannot be negative');
    }

    if (fareStructure.perKilometerRate < 0) {
        throw new Error('Per kilometer rate cannot be negative');
    }

    // Calculate distance-based fare
    const distanceFare = distanceInKm * fareStructure.perKilometerRate;

    // Calculate waiting charges (if duration provided and waiting charge is set)
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    const waitingChargePerMinute = fareStructure.waitingChargePerMinute || 0;
    const waitingCharge = durationInMinutes * waitingChargePerMinute;

    // Total fare = base fare + distance fare + waiting charge
    const totalFare = baseFare + distanceFare + waitingCharge;

    // Return the maximum of minimum fare and calculated fare
    return Math.max(fareStructure.minimumFare, totalFare);
}

/**
 * Format fare to 2 decimal places
 * @param fare - Fare amount in currency
 * @returns Formatted fare as string
 */
export function formatFare(fare: number): string {
    return fare.toFixed(2);
}

/**
 * Calculate fare summary with breakdown
 * Useful for displaying fare details to users
 *
 * @param input - Fare calculation input
 * @returns Object containing total fare and breakdown
 */
export function calculateFareWithBreakdown(input: FareCalculationInput): {
    baseFare: number;
    distanceFare: number;
    waitingCharge: number;
    totalBeforeMinimum: number;
    minimumFare: number;
    finalFare: number;
} {
    const {
        distanceInKm,
        durationInSeconds = 0,
        fareStructure,
        baseFare = 0,
    } = input;

    const distanceFare = distanceInKm * fareStructure.perKilometerRate;
    const durationInMinutes = Math.ceil(durationInSeconds / 60);
    const waitingCharge =
        durationInMinutes * (fareStructure.waitingChargePerMinute || 0);
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
