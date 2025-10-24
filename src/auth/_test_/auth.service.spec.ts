import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../repositories/user/user.repository';
import { AgencyRepository } from '../../repositories/agency/agency.repository';
import { RegistrationRequestRepository } from '../../repositories/registration-request/registration-request.repository';
import { EmailService } from '../../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as hash from '../../utils/hash';

// Mock the hash utilities
jest.mock('../../utils/hash', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(() => 'mock-token-123'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let agencyRepo: jest.Mocked<AgencyRepository>;
  let requestRepo: jest.Mocked<RegistrationRequestRepository>;
  let emailService: jest.Mocked<EmailService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByIdentifier: jest.fn(),
            updateFieldsById: jest.fn(),
            usernameExists: jest.fn(),
            emailExists: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: AgencyRepository,
          useValue: {
            agencyNameExist: jest.fn(),
            licenseExists: jest.fn(),
            findByPublicCode: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: RegistrationRequestRepository,
          useValue: {
            idCardExists: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(UserRepository);
    agencyRepo = module.get(AgencyRepository);
    requestRepo = module.get(RegistrationRequestRepository);
    emailService = module.get(EmailService);
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    const loginDto = {
      identifier: 'testuser',
      password: 'password123',
      rememberMe: false,
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        status: 'active',
        role: 'user',
        email_verified: true, // ✅ Added
      };

      userRepo.findByIdentifier.mockResolvedValue(mockUser as any);
      (hash.comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto, 'al');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'mock-jwt-token');
      expect(userRepo.updateFieldsById).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ last_login: expect.any(Date) }),
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepo.findByIdentifier.mockResolvedValue(null);

      await expect(service.login(loginDto, 'al')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if account is not active', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        status: 'inactive',
        password: 'hashedpassword',
        email: 'test@example.com',
        role: 'user',
        email_verified: true, // ✅ Added
      };

      userRepo.findByIdentifier.mockResolvedValue(mockUser as any);

      await expect(service.login(loginDto, 'al')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        status: 'active',
        password: 'hashedpassword',
        email: 'test@example.com',
        role: 'user',
        email_verified: true, // ✅ Added
      };

      userRepo.findByIdentifier.mockResolvedValue(mockUser as any);
      (hash.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto, 'al')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should use 30d token expiry when rememberMe is true', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        status: 'active',
        role: 'user',
        email_verified: true, // ✅ Added
      };

      userRepo.findByIdentifier.mockResolvedValue(mockUser as any);
      (hash.comparePassword as jest.Mock).mockResolvedValue(true);

      await service.login({ ...loginDto, rememberMe: true }, 'al');

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        { expiresIn: '30d' },
      );
    });
  });

  describe('registerUser', () => {
    const userDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      repeatPassword: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should register user successfully', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      userRepo.create.mockResolvedValue(1);

      const result = await service.registerUser(userDto as any, 'al');

      expect(result).toHaveProperty('userId', 1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'new@example.com',
        'newuser',
        'mock-token-123',
        'al',
      );
    });

    it('should throw BadRequestException if username exists', async () => {
      userRepo.usernameExists.mockResolvedValue(true);
      userRepo.emailExists.mockResolvedValue(false);

      await expect(service.registerUser(userDto as any, 'al')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email exists', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(true);

      await expect(service.registerUser(userDto as any, 'al')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('registerAgencyOwner', () => {
    const agencyDto = {
      username: 'agencyowner',
      email: 'agency@example.com',
      password: 'password123',
      repeatPassword: 'password123',
      first_name: 'Jane',
      last_name: 'Smith',
      agency_name: 'Real Estate Pro',
      license_number: 'LIC123456',
      address: '123 Main St',
    };

    it('should register agency owner successfully', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.agencyNameExist.mockResolvedValue(false);
      agencyRepo.licenseExists.mockResolvedValue(false);
      userRepo.create.mockResolvedValue(2);

      const result = await service.registerAgencyOwner(agencyDto as any, 'al');

      expect(result).toHaveProperty('userId', 2);
      expect(agencyRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          agency_name: 'Real Estate Pro',
          license_number: 'LIC123456',
          owner_user_id: 2,
        }),
      );
    });

    it('should throw BadRequestException if agency name exists', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.agencyNameExist.mockResolvedValue(true);

      await expect(
        service.registerAgencyOwner(agencyDto as any, 'al'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if license exists', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.agencyNameExist.mockResolvedValue(false);
      agencyRepo.licenseExists.mockResolvedValue(true);

      await expect(
        service.registerAgencyOwner(agencyDto as any, 'al'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('registerAgent', () => {
    const agentDto = {
      username: 'agent1',
      email: 'agent@example.com',
      password: 'password123',
      repeatPassword: 'password123',
      first_name: 'Bob',
      last_name: 'Agent',
      public_code: 'AGENCY123',
      id_card_number: 'ID987654',
      requested_role: 'agent',
    };

    it('should register agent successfully', async () => {
      const mockAgency = { id: 5, agency_name: 'Real Estate Pro' };

      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.findByPublicCode.mockResolvedValue(mockAgency as any);
      requestRepo.idCardExists.mockResolvedValue(false);
      userRepo.create.mockResolvedValue(3);

      const result = await service.registerAgent(agentDto as any, 'al');

      expect(result).toHaveProperty('userId', 3);
      expect(requestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 3,
          idCardNumber: 'ID987654',
          agencyId: 5,
          status: 'pending',
        }),
      );
    });

    it('should throw BadRequestException if public code is invalid', async () => {
      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.findByPublicCode.mockResolvedValue(null);

      await expect(
        service.registerAgent(agentDto as any, 'al'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if ID card exists', async () => {
      const mockAgency = { id: 5, agency_name: 'Real Estate Pro' };

      userRepo.usernameExists.mockResolvedValue(false);
      userRepo.emailExists.mockResolvedValue(false);
      agencyRepo.findByPublicCode.mockResolvedValue(mockAgency as any);
      requestRepo.idCardExists.mockResolvedValue(true);

      await expect(
        service.registerAgent(agentDto as any, 'al'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});