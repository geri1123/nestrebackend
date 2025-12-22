import { BadRequestException } from '@nestjs/common';
import { UploadProductImagesUseCase } from '../upload-product-images.use-case';

describe('UploadProductImagesUseCase', () => {
  let useCase: UploadProductImagesUseCase;

  const repo = {
    create: jest.fn(),
  } as any;

  const cloudinary = {
    uploadFile: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UploadProductImagesUseCase(repo, cloudinary);
  });

  const validFile = {
    mimetype: 'image/png',
    size: 1024,
  } as any;

  it('should throw if no files are provided', async () => {
    await expect(
      useCase.execute([], 1, 10, 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if more than 7 images are uploaded', async () => {
    const files = Array(8).fill(validFile);

    await expect(
      useCase.execute(files, 1, 10, 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if file mimetype is invalid', async () => {
    const invalidFile = { ...validFile, mimetype: 'application/pdf' };

    await expect(
      useCase.execute([invalidFile], 1, 10, 'en'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should upload images and save records successfully', async () => {
    cloudinary.uploadFile.mockResolvedValue({
      url: 'https://img.test/1.png',
      publicId: 'public-1',
    });

    repo.create.mockResolvedValue({
      id: 1,
      imageUrl: 'https://img.test/1.png',
      publicId: 'public-1',
    });

    const result = await useCase.execute(
      [validFile],
      1,
      10,
      'en',
    );

    expect(cloudinary.uploadFile).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
    expect(result[0].imageUrl).toBe('https://img.test/1.png');
  });
});