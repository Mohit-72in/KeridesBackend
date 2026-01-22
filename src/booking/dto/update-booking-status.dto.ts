export class UpdateBookingStatusDto {
    status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
}
