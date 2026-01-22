import { Test, TestingModule } from '@nestjs/testing';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

describe('DriverController', () => {
  let controller: DriverController;
  const mockDriverService = {
    getAllDrivers: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverController],
      providers: [
        { provide: DriverService, useValue: mockDriverService },
        { provide: 'S3Service', useValue: { uploadFile: jest.fn() } },
        { provide: 'DriverNotificationService', useValue: { subscribeDriver: jest.fn(), isDriverConnected: jest.fn().mockReturnValue(false) } },
      ],
    }).compile();

    controller = module.get<DriverController>(DriverController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAllDrivers should parse query params and call service', async () => {
    const result = await controller.getAllDrivers('true', 'area51', '2', '5');
    expect(mockDriverService.getAllDrivers).toHaveBeenCalledWith(
      { isOnline: true, area: 'area51' },
      2,
      5,
    );
    expect(result).toEqual({ items: [], total: 0 });
  });
});
