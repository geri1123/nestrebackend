import { BadRequestException } from '@nestjs/common';
import { DeleteProfileImageUseCase } from '../delete-profile-image.use-case';

describe('DeleteProfileImageUseCase', () => {
  let useCase: DeleteProfileImageUseCase;

  const userRepo = {
    findById: jest.fn(),
    deleteProfileImage: jest.fn(),
  } as any;

  const cloudinary = {
    deleteFile: jest.fn(),
  } as any;

  const getUserProfile = {
    execute: jest.fn(), // not used in this case, can be left as is
  } as any;

  const userWithImage = {
    hasProfileImage: () => true,
    profileImgPublicId: 'public-id-1',
    removeProfileImage: jest.fn(),
  };

  const userWithoutImage = {
    hasProfileImage: () => false,
    profileImgPublicId: null,
    removeProfileImage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteProfileImageUseCase(
      userRepo,
      cloudinary,
      getUserProfile,
    );
  });

  it('should throw BadRequestException if user has no profile image', async () => {
    userRepo.findById.mockResolvedValue(userWithoutImage);

    await expect(useCase.execute(1, 'en')).rejects.toThrow(BadRequestException);

    expect(cloudinary.deleteFile).not.toHaveBeenCalled();
    expect(userRepo.deleteProfileImage).not.toHaveBeenCalled();
  });

  it('should delete profile image from cloudinary and DB when image exists', async () => {
    userRepo.findById.mockResolvedValue(userWithImage);
    cloudinary.deleteFile.mockResolvedValue(undefined);

    await useCase.execute(1, 'en');

    expect(cloudinary.deleteFile).toHaveBeenCalledWith('public-id-1');
    expect(userRepo.deleteProfileImage).toHaveBeenCalledWith(1);
    expect(userWithImage.removeProfileImage).toHaveBeenCalled();
  });

  it('should throw BadRequestException if user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 'en')).rejects.toThrow(BadRequestException);
    expect(cloudinary.deleteFile).not.toHaveBeenCalled();
    expect(userRepo.deleteProfileImage).not.toHaveBeenCalled();
  });

  it('should catch Cloudinary errors but still delete DB entry', async () => {
    userRepo.findById.mockResolvedValue(userWithImage);
    cloudinary.deleteFile.mockRejectedValue(new Error('Cloud error'));

    await useCase.execute(1, 'en');

    expect(cloudinary.deleteFile).toHaveBeenCalledWith('public-id-1');
    expect(userRepo.deleteProfileImage).toHaveBeenCalledWith(1);
    expect(userWithImage.removeProfileImage).toHaveBeenCalled();
  });
});
