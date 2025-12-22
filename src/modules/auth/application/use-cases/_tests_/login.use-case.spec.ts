import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../login.use-case';
import { FindUserForAuthUseCase } from '../../../../users/application/use-cases/find-user-for-auth.use-case';
import { UpdateLastLoginUseCase } from '../../../../users/application/use-cases/update-last-login.use-case';
import { FindUserByIdUseCase } from '../../../../users/application/use-cases/find-user-by-id.use-case';
import { AuthTokenService } from '../../../infrastructure/services/auth-token.service';
import * as hashUtils from '../../../../../common/utils/hash';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  const findUserForAuthMock = {
    execute: jest.fn(),
  };

  const updateLastLoginMock = {
    execute: jest.fn(),
  };

  const findUserByIdMock = {
    execute: jest.fn(),
  };

  const authTokenServiceMock = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    jest.spyOn(hashUtils, 'comparePassword');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: FindUserForAuthUseCase, useValue: findUserForAuthMock },
        { provide: UpdateLastLoginUseCase, useValue: updateLastLoginMock },
        { provide: FindUserByIdUseCase, useValue: findUserByIdMock },
        { provide: AuthTokenService, useValue: authTokenServiceMock },
      ],
    }).compile();

    useCase = module.get(LoginUseCase);

    jest.clearAllMocks();
  });

  // ---------------- FAILURES ----------------

  it('throws if user not found', async () => {
    findUserForAuthMock.execute.mockResolvedValue(null);

    await expect(
      useCase.execute(
        { identifier: 'test@test.com', password: '123456' },
        'al',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws if user not active', async () => {
    findUserForAuthMock.execute.mockResolvedValue({
      id: 1,
      status: 'inactive',
      password: 'hashed',
    });

    await expect(
      useCase.execute(
        { identifier: 'test@test.com', password: '123456' },
        'al',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws if password mismatch', async () => {
    findUserForAuthMock.execute.mockResolvedValue({
      id: 1,
      status: 'active',
      password: 'hashed',
    });

    (hashUtils.comparePassword as jest.Mock).mockResolvedValue(false);

    await expect(
      useCase.execute(
        { identifier: 'test@test.com', password: 'wrong' },
        'al',
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  // ---------------- SUCCESS ----------------

  it('logs in successfully', async () => {
    findUserForAuthMock.execute.mockResolvedValue({
      id: 1,
      status: 'active',
      password: 'hashed',
    });

    (hashUtils.comparePassword as jest.Mock).mockResolvedValue(true);

    findUserByIdMock.execute.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@test.com',
      role: 'user',
    });

    authTokenServiceMock.generate.mockReturnValue('jwt-token');

    const result = await useCase.execute(
      { identifier: 'john@test.com', password: '123456' },
      'al',
    );

    expect(updateLastLoginMock.execute).toHaveBeenCalledWith(1);
    expect(authTokenServiceMock.generate).toHaveBeenCalledWith(
      expect.any(Object),
      1,
    );

    expect(result).toEqual({
      user: expect.any(Object),
      token: 'jwt-token',
    });
  });

  it('uses 30 days token when rememberMe = true', async () => {
    findUserForAuthMock.execute.mockResolvedValue({
      id: 1,
      status: 'active',
      password: 'hashed',
    });

    (hashUtils.comparePassword as jest.Mock).mockResolvedValue(true);

    findUserByIdMock.execute.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@test.com',
      role: 'user',
    });

    authTokenServiceMock.generate.mockReturnValue('jwt-token');

    await useCase.execute(
      {
        identifier: 'john@test.com',
        password: '123456',
        rememberMe: true,
      },
      'al',
    );

    expect(authTokenServiceMock.generate).toHaveBeenCalledWith(
      expect.any(Object),
      30,
    );
  });
});