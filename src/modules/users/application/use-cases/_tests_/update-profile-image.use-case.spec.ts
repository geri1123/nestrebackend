import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UploadProfileImageUseCase } from '../update-profile-image.use-case';

describe('UploadProfileImageUseCase', () => {
  let useCase: UploadProfileImageUseCase;

  const userRepo = {
    findById: jest.fn(),
    updateProfileImage: jest.fn(),
  } as any;

  const cloudinary = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  } as any;

  const imageUtils = {
    validateFile: jest.fn(),
  } as any;

  const validFile = {
    mimetype: 'image/png',
    size: 1024,
  } as any;

  const user = {
    profileImgPublicId: null,
    updateProfileImage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UploadProfileImageUseCase(
      userRepo,
      cloudinary,
      imageUtils,
    );
  });

  it('should throw NotFoundException if user does not exist', async () => {
    imageUtils.validateFile.mockImplementation(() => {});
    userRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(1, validFile, 'en'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should upload image and update user successfully', async () => {
    imageUtils.validateFile.mockImplementation(() => {});
    userRepo.findById.mockResolvedValue(user);

    cloudinary.uploadFile.mockResolvedValue({
      url: 'http://img.test',
      publicId: 'img-1',
    });

    const result = await useCase.execute(1, validFile, 'en');

    expect(cloudinary.uploadFile).toHaveBeenCalled();
    expect(userRepo.updateProfileImage).toHaveBeenCalledWith(
      1,
      'http://img.test',
      'img-1',
    );
    expect(result.url).toBe('http://img.test');
  });

  it('should rollback cloudinary upload if DB update fails', async () => {
    imageUtils.validateFile.mockImplementation(() => {});
    userRepo.findById.mockResolvedValue(user);

    cloudinary.uploadFile.mockResolvedValue({
      url: 'http://img.test',
      publicId: 'img-1',
    });

    userRepo.updateProfileImage.mockRejectedValue(new Error('DB error'));

    await expect(
      useCase.execute(1, validFile, 'en'),
    ).rejects.toThrow(InternalServerErrorException);

    expect(cloudinary.deleteFile).toHaveBeenCalledWith('img-1');
  });
});