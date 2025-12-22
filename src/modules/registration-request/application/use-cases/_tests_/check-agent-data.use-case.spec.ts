import { CheckAgentDataUseCase } from '../check-agent-data.use-case';
import { BadRequestException } from '@nestjs/common';

describe('CheckAgentDataUseCase', () => {
  let useCase: CheckAgentDataUseCase;

  const repo = {} as any; // not used
  const getAgencyByPublicCode = { execute: jest.fn() } as any;
  const ensureIdCardUnique = { execute: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CheckAgentDataUseCase(
      repo,
      getAgencyByPublicCode,
      ensureIdCardUnique,
    );
  });

  it('should return empty errors when public code and id card are valid', async () => {
    getAgencyByPublicCode.execute.mockResolvedValue({ id: 1 });
    ensureIdCardUnique.execute.mockResolvedValue(undefined);

    const result = await useCase.execute('VALID123', 'ID123', 'en');

    expect(result).toEqual({});
  });

  it('should return error when public code is invalid', async () => {
    getAgencyByPublicCode.execute.mockRejectedValue(new Error('Invalid code'));
    ensureIdCardUnique.execute.mockResolvedValue(undefined);

    const result = await useCase.execute('BADCODE', 'ID123', 'en');

    expect(result).toHaveProperty('public_code');
    expect(result.public_code.length).toBe(1);
  });

  it('should throw when id card is not unique', async () => {
    getAgencyByPublicCode.execute.mockResolvedValue({ id: 1 });
    ensureIdCardUnique.execute.mockRejectedValue(
      new BadRequestException('Duplicate ID card'),
    );

    await expect(
      useCase.execute('VALID123', 'DUPLICATE-ID', 'en'),
    ).rejects.toThrow(BadRequestException);
  });
});