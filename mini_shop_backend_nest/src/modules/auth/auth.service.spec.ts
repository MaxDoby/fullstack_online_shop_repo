import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptCompareMock = bcrypt.compare as jest.MockedFunction<
  (password: string, hash: string) => Promise<boolean>
>;

describe('AuthService', () => {
  let authService: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    createUser: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should throw ConflictException if email is already used.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
    });

    await expect(
      authService.registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should throw ConflictException if username is already used.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);
    usersServiceMock.findByUsername.mockResolvedValue({
      id: 1,
      username: 'testuser',
    });

    await expect(
      authService.registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should register user successfully.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);
    usersServiceMock.findByUsername.mockResolvedValue(null);

    usersServiceMock.createUser.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      role: 'USER',
    });

    jwtServiceMock.signAsync.mockResolvedValue('access-token');

    const result = await authService.registerUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.username).toBe('testuser');
    expect(usersServiceMock.createUser).toHaveBeenCalled();
    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if login user does not exist.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    await expect(
      authService.loginUser({
        identifier: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
      'test@example.com',
    );
  });

  it('should throw UnauthorizedException if password is wrong.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      role: 'USER',
    });

    bcryptCompareMock.mockResolvedValue(false);

    await expect(
      authService.loginUser({
        identifier: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should login user successfully.', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed-password',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      role: 'USER',
    });

    bcryptCompareMock.mockResolvedValue(true);
    jwtServiceMock.signAsync.mockResolvedValue('access-token');

    const result = await authService.loginUser({
      identifier: 'test@example.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.username).toBe('testuser');
    expect(bcryptCompareMock).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );
    expect(jwtServiceMock.signAsync).toHaveBeenCalled();
  });
});
