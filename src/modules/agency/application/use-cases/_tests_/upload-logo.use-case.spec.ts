import { Test, TestingModule } from '@nestjs/testing';
import { UploadAgencyLogoUseCase } from '../upload-logo.use-case';
import { AGENCY_REPO } from '../../../domain/repositories/agency.repository.interface';
import { GetAgencyByIdUseCase } from '../get-agency-by-id.use-case';
import { ImageUtilsService } from '../../../../../common/utils/image-utils.service';
import { CloudinaryService } from '../../../../../infrastructure/cloudinary/cloudinary.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
describe('UploadAgencyLogoUseCase', () => {
  let useCase: UploadAgencyLogoUseCase;

  const agencyRepo = {
    findLogoById: jest.fn(),
    updateFields: jest.fn(),
  };

  const getAgencyById = {
    execute: jest.fn(),
  };

  const imageUtils = {
    validateFile: jest.fn(),
    isDefaultImage: jest.fn(),
  };

  const cloudinary = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockFile = {
    buffer: Buffer.from('image'),
    mimetype: 'image/png',
    size: 1000,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadAgencyLogoUseCase,
        { provide: AGENCY_REPO, useValue: agencyRepo },
        { provide: GetAgencyByIdUseCase, useValue: getAgencyById },
        { provide: ImageUtilsService, useValue: imageUtils },
        { provide: CloudinaryService, useValue: cloudinary },
      ],
    }).compile();

    useCase = module.get(UploadAgencyLogoUseCase);
    jest.clearAllMocks();
  });

  it('uploads logo and deletes old logo successfully', async () => {
    imageUtils.validateFile.mockReturnValue(undefined);
    imageUtils.isDefaultImage.mockReturnValue(false);
    getAgencyById.execute.mockResolvedValue({});
    agencyRepo.findLogoById.mockResolvedValue({ logoPublicId: 'old-logo' });

    cloudinary.uploadFile.mockResolvedValue({
      url: 'new-url',
      publicId: 'new-logo',
    });

    const result = await useCase.execute(1, mockFile, 'al');

    expect(cloudinary.uploadFile).toHaveBeenCalled();
    expect(agencyRepo.updateFields).toHaveBeenCalledWith(1, {
      logo: 'new-url',
      logoPublicId: 'new-logo',
    });
    expect(cloudinary.deleteFile).toHaveBeenCalledWith('old-logo');
    expect(result).toEqual({ url: 'new-url', publicId: 'new-logo' });
  });

  it('throws if image validation fails', async () => {
    imageUtils.validateFile.mockImplementation(() => {
      throw new BadRequestException();
    });

    await expect(useCase.execute(1, mockFile, 'al')).rejects.toThrow(
      BadRequestException,
    );

    expect(cloudinary.uploadFile).not.toHaveBeenCalled();
  });

  it('throws if cloudinary upload fails', async () => {
    imageUtils.validateFile.mockReturnValue(undefined);
    getAgencyById.execute.mockResolvedValue({});
    agencyRepo.findLogoById.mockResolvedValue(null);

    cloudinary.uploadFile.mockRejectedValue(new Error('Upload failed'));

    await expect(useCase.execute(1, mockFile, 'al')).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(agencyRepo.updateFields).not.toHaveBeenCalled();
  });

  it('rolls back cloudinary upload if DB update fails', async () => {
    imageUtils.validateFile.mockReturnValue(undefined);
    imageUtils.isDefaultImage.mockReturnValue(true);
    getAgencyById.execute.mockResolvedValue({});
    agencyRepo.findLogoById.mockResolvedValue(null);

    cloudinary.uploadFile.mockResolvedValue({
      url: 'url',
      publicId: 'new-logo',
    });

    agencyRepo.updateFields.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute(1, mockFile, 'al')).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(cloudinary.deleteFile).toHaveBeenCalledWith('new-logo');
  });

  it('does not fail if old logo deletion fails', async () => {
  imageUtils.validateFile.mockReturnValue(undefined);
  imageUtils.isDefaultImage.mockReturnValue(false);
  getAgencyById.execute.mockResolvedValue({});
  agencyRepo.findLogoById.mockResolvedValue({ logoPublicId: 'old-logo' });
  
  
  agencyRepo.updateFields.mockResolvedValue(undefined);

  cloudinary.uploadFile.mockResolvedValue({
    url: 'new-url',
    publicId: 'new-logo',
  });

 
  cloudinary.deleteFile.mockRejectedValueOnce(new Error('Delete failed'));

  const result = await useCase.execute(1, mockFile, 'al');

  expect(result.publicId).toBe('new-logo');
});
});