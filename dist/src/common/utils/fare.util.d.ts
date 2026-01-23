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
export declare function calculateFare(input: FareCalculationInput): number;
export declare function formatFare(fare: number): string;
export declare function calculateFareWithBreakdown(input: FareCalculationInput): {
    baseFare: number;
    distanceFare: number;
    waitingCharge: number;
    totalBeforeMinimum: number;
    minimumFare: number;
    finalFare: number;
};
