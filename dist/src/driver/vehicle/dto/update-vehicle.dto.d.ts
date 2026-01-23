declare class DocumentsDto {
    Driving_Licence?: string;
    Police_Clearance_Certificate?: string;
    Proof_Of_Address?: string;
    Vehicle_Insurance_Proof?: string;
}
declare class FareStructureDto {
    minimumFare?: number;
    perKilometerRate?: number;
    waitingChargePerMinute?: number;
}
export declare class UpdateVehicleDto {
    make?: string;
    vehicleModel?: string;
    year?: number;
    seatsNo?: number;
    licensePlate?: string;
    vehicleType?: string;
    vehicleClass?: string;
    vehicleImages?: string[];
    documents?: DocumentsDto;
    fareStructure?: FareStructureDto;
}
export {};
