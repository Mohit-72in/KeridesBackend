import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { DriverService } from '../driver/driver.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const mockUserService = { findById: jest.fn() };
  const mockDriverService = { findById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: DriverService, useValue: mockDriverService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('returns user payload when user exists', async () => {
    mockUserService.findById.mockResolvedValue({ _id: '1', fullName: 'A' });
    const out = await strategy.validate({ id: '1', role: 'USER' });
    expect(out).toEqual({ id: '1', role: 'USER' });
  });

  it('throws Unauthorized when user missing', async () => {
    mockUserService.findById.mockResolvedValue(null);
    await expect(strategy.validate({ id: '999', role: 'USER' })).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns driver payload when driver exists', async () => {
    mockDriverService.findById.mockResolvedValue({ _id: 'd1', fullName: 'D' });
    const out = await strategy.validate({ id: 'd1', role: 'DRIVER' });
    expect(out).toEqual({ id: 'd1', role: 'DRIVER' });
  });

  it('throws Unauthorized when driver missing', async () => {
    mockDriverService.findById.mockResolvedValue(null);
    await expect(strategy.validate({ id: 'd-not', role: 'DRIVER' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});