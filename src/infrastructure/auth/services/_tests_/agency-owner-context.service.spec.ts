import { Test } from '@nestjs/testing';
import { AgencyOwnerContextService } from '../agency-owner-context.service';
import { GetAgencyByOwnerUseCase } from '../../../../modules/agency/application/use-cases/get-agency-by-owner.use-case';
import { ForbiddenException } from '@nestjs/common';
import { AgencyStatus } from '@prisma/client';

describe('AgencyOwnerContextService', () => {
  let service: AgencyOwnerContextService;
  let getAgencyByOwnerMock: any;

  const mockAgency = {
    id: 1,
    agencyName: 'Best Agency',
    agencyEmail: 'agency@example.com',
    logo: 'logo.png',
    status: AgencyStatus.active,
    address: '123 Main St',
    phone: '+355691234567',
    website: 'https://bestagency.com',
    licenseNumber: 'LIC123456',
    publicCode: 'ABC123',
  };

  beforeEach(async () => {
    getAgencyByOwnerMock = { execute: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AgencyOwnerContextService,
        {
          provide: GetAgencyByOwnerUseCase,
          useValue: getAgencyByOwnerMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AgencyOwnerContextService);
  });

  describe('getAgencyData', () => {
    it('returns agency data for a user', async () => {
      getAgencyByOwnerMock.execute.mockResolvedValue(mockAgency);

      const result = await service.getAgencyData(1, 'en');

      expect(getAgencyByOwnerMock.execute).toHaveBeenCalledWith(1, 'en');
      expect(result).toEqual({
        id: 1,
        name: 'Best Agency',
        email: 'agency@example.com',
        logo: 'logo.png',
        status: AgencyStatus.active,
        address: '123 Main St',
        phone: '+355691234567',
        website: 'https://bestagency.com',
        licenseNumber: 'LIC123456',
        publicCode: 'ABC123',
      });
    });
  });

  describe('loadAgencyOwnerContext', () => {
    it('sets context on request object', async () => {
      getAgencyByOwnerMock.execute.mockResolvedValue(mockAgency);

      const req: any = { user: { id: 1 } };
      await service.loadAgencyOwnerContext(req, 'en');

      expect(req.agencyId).toBe(1);
      expect(req.agencyStatus).toBe(AgencyStatus.active);
      expect(req.isAgencyOwner).toBe(true);
    });
  });

  describe('validateAgencyStatus', () => {
    it('does not throw if agency status is active', () => {
      const req: any = { agencyStatus: AgencyStatus.active };
      expect(() => service.validateAgencyStatus(req, 'en')).not.toThrow();
    });

    it('throws ForbiddenException if agency is suspended', () => {
      const req: any = { agencyStatus: AgencyStatus.suspended };
      expect(() => service.validateAgencyStatus(req, 'en')).toThrow(ForbiddenException);
    });
  });
});
