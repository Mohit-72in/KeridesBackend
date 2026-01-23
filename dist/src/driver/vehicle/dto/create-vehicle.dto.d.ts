declare class DocumentsDto {
    Driving_Licence?: string;
    Vehicle_Insurance_Proof?: string;
    Proof_Of_Address?: string;
    Police_Clearance_Certificate?: string;
}
declare class FareStructureDto {
    minimumFare: number;
    perKilometerRate: number;
    waitingChargePerMinute: number;
}
export declare class CreateVehicleDto {
    make: string;
    vehicleModel: string;
    year: number;
    seatsNo: number;
    licensePlate: string;
    vehicleType: string;
    vehicleClass: string;
    vehicleImages?: string[];
    documents?: DocumentsDto;
    fareStructure: FareStructureDto;
    operatingArea?: string;
}
export {};
