export class EstimateFareDto {
    distance: { value: number; text?: string };
    duration: { value: number; text?: string };
    vehicleId?: string;
    driverId?: string;
}