import {NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UploadProfileImageUseCase } from '../update-profile-image.use-case';
import { UserEventPublisher } from '../../events/user-event.publisher';

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

  const userEventPublisher = {
    userUpdated: jest.fn(),
  } as Partial<UserEventPublisher>;

  const validFile = { mimetype: 'image/png', size: 1024 } as any;

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
      userEventPublisher as UserEventPublisher
    );
  });

  it('should throw NotFoundException if user does not exist', async () => {
    imageUtils.validateFile.mockImplementation(() => {});
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(1, validFile, 'en'))
      .rejects
      .toThrow(NotFoundException);

    expect(userEventPublisher.userUpdated).not.toHaveBeenCalled();
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
    expect(user.updateProfileImage).toHaveBeenCalledWith('http://img.test', 'img-1');
    expect(userRepo.updateProfileImage).toHaveBeenCalledWith(1, 'http://img.test', 'img-1');
    expect(userEventPublisher.userUpdated).toHaveBeenCalledWith(1);
    expect(result.url).toBe('http://img.test');
    expect(result.publicId).toBe('img-1');
  });

  it('should rollback cloudinary upload if DB update fails', async () => {
    imageUtils.validateFile.mockImplementation(() => {});
    userRepo.findById.mockResolvedValue(user);

    cloudinary.uploadFile.mockResolvedValue({
      url: 'http://img.test',
      publicId: 'img-1',
    });

    userRepo.updateProfileImage.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute(1, validFile, 'en'))
      .rejects
      .toThrow(InternalServerErrorException);

    expect(cloudinary.deleteFile).toHaveBeenCalledWith('img-1');
    expect(userEventPublisher.userUpdated).not.toHaveBeenCalled();
  });
});