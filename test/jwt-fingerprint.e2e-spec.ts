import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../src/user/user.service';
import { DriverService } from '../src/driver/driver.service';
import * as bcrypt from 'bcrypt';

// Dev-only: verifies SIGN and VERIFY fingerprint parity to catch secret/config mismatches early.
// Skips in production environments.
const IS_PROD = process.env.NODE_ENV === 'production';

(IS_PROD ? describe.skip : describe)('JWT sign/verify fingerprint (dev-only)', () => {
  let moduleRef: TestingModule | undefined;
  let authService: AuthService;
  let strategy: JwtStrategy;

  const mockUser = {
    _id: 'u-test-1',
    fullName: 'TF User',
    email: 'tf@example.com',
    password: bcrypt.hashSync('password', 8),
  } as any;

  const mockUserService = {
    findByEmail: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue({ ...mockUser, _id: 'u-test-1' }),
  };

  const mockDriverService = { findById: jest.fn().mockResolvedValue(null) };

  beforeAll(async () => {
    // Ensure a deterministic secret for CI/dev runs
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-e2e';

    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: DriverService, useValue: mockDriverService },
        { provide: JwtService, useValue: { sign: jest.fn((payload) => `tok-${payload.id || 'x'}`), verify: jest.fn() } },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    strategy = moduleRef.get<JwtStrategy>(JwtStrategy);
  });

  afterAll(async () => {
    if (moduleRef && typeof moduleRef.close === 'function') {
      await moduleRef.close();
    }
    jest.restoreAllMocks();
  });

  it('should produce matching SIGN and VERIFY fingerprints', async () => {
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});

    // Trigger sign (loginUser uses sign)
    await authService.loginUser({ email: mockUser.email, password: 'password' } as any);

    // JwtStrategy constructor runs during module.get and logs VERIFY fingerprint
    expect(debugSpy).toHaveBeenCalled();

    const calls = debugSpy.mock.calls.map((c) => String(c[0]));
    const signCall = calls.find((c) => c.includes('AuthService] SIGN fingerprint='));
    const verifyCall = calls.find((c) => c.includes('VERIFY secret fingerprint='));

    expect(signCall).toBeDefined();
    expect(verifyCall).toBeDefined();

    const signFp = /SIGN fingerprint=(\w{8})/.exec(signCall as string)?.[1];
    const verifyFp = /VERIFY secret fingerprint=(\w{8})/.exec(verifyCall as string)?.[1];

    expect(signFp).toBeDefined();
    expect(verifyFp).toBeDefined();
    expect(signFp).toEqual(verifyFp);

    debugSpy.mockRestore();
  });
});
