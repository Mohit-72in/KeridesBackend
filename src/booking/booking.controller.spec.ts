import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { ForbiddenException } from '@nestjs/common';

describe('BookingController (driver bookings)', () => {
  let controller: BookingController;
  const mockBookingService = {
    getBookingsByDriver: jest.fn().mockResolvedValue([{ id: 'b1' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [{ provide: BookingService, useValue: mockBookingService }],
    }).compile();

    controller = module.get<BookingController>(BookingController);
  });

  afterEach(() => jest.clearAllMocks());

  it('allows driver to fetch their own bookings', async () => {
    const req: any = { user: { id: 'driver-1' }, headers: {} };
    const out = await controller.getBookingsForDriverById('driver-1', req);
    expect(mockBookingService.getBookingsByDriver).toHaveBeenCalledWith('driver-1');
    expect(out).toEqual([{ id: 'b1' }]);
  });

  it('allows admin via x-admin-key to fetch any driver bookings', async () => {
    process.env.ADMIN_API_KEY = 'adminkey-xyz';
    const req: any = { user: {}, headers: { 'x-admin-key': 'adminkey-xyz' } };
    const out = await controller.getBookingsForDriverById('driver-2', req);
    expect(mockBookingService.getBookingsByDriver).toHaveBeenCalledWith('driver-2');
    expect(out).toEqual([{ id: 'b1' }]);
  });

  it('throws ForbiddenException when caller is not self or admin', async () => {
    const req: any = { user: { id: 'driver-1' }, headers: { 'x-admin-key': '' } };
    await expect(controller.getBookingsForDriverById('driver-XX', req)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
