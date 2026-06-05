import { DeleteProductImagesUseCase } from "../delete-product-images.use-case";

describe('DeleteProductImagesUseCase', () => {
  let useCase: DeleteProductImagesUseCase;

  const repo = {
    findByIds: jest.fn(),
    findByProductId: jest.fn(),
    deleteByIds: jest.fn(),
    deleteByProductId: jest.fn(),
  } as any;

  const cloudinary = {
    deleteFile: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    // IMPORTANT: always return Promise (fix .catch crash)
    cloudinary.deleteFile.mockResolvedValue(true);

    useCase = new DeleteProductImagesUseCase(repo, cloudinary);
  });

  // ─────────────────────────────────────────────
  describe('byIds', () => {
    it('should delete images from cloudinary and db', async () => {
      repo.findByIds.mockResolvedValue([
        { publicId: 'img1' },
        { publicId: 'img2' },
      ]);

      await useCase.byIds([1, 2]);

      expect(cloudinary.deleteFile).toHaveBeenCalledTimes(2);
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img1');
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img2');

      expect(repo.deleteByIds).toHaveBeenCalledWith([1, 2]);
    });

    it('should not do anything when ids array is empty', async () => {
      await useCase.byIds([]);

      expect(cloudinary.deleteFile).not.toHaveBeenCalled();
      expect(repo.deleteByIds).not.toHaveBeenCalled();
    });

    it('should ignore images without publicId', async () => {
      repo.findByIds.mockResolvedValue([
        { publicId: null },
        { publicId: 'img2' },
      ]);

      await useCase.byIds([1, 2]);

      expect(cloudinary.deleteFile).toHaveBeenCalledTimes(1);
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img2');
    });
  });

  // ─────────────────────────────────────────────
  describe('fromCloudOnly', () => {
    it('should delete only from cloudinary', async () => {
      await useCase.fromCloudOnly(['pub1', 'pub2']);

      expect(cloudinary.deleteFile).toHaveBeenCalledTimes(2);
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('pub1');
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('pub2');

      expect(repo.deleteByIds).not.toHaveBeenCalled();
    });

    it('should not call cloudinary when empty array', async () => {
      await useCase.fromCloudOnly([]);

      expect(cloudinary.deleteFile).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  describe('byProductId', () => {
    it('should delete all images from cloudinary and db', async () => {
      repo.findByProductId.mockResolvedValue([
        { publicId: 'img1' },
        { publicId: 'img2' },
      ]);

      await useCase.byProductId(10);

      expect(cloudinary.deleteFile).toHaveBeenCalledTimes(2);
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img1');
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img2');

      expect(repo.deleteByProductId).toHaveBeenCalledWith(10);
    });

    it('should do nothing when product has no images', async () => {
      repo.findByProductId.mockResolvedValue([]);

      await useCase.byProductId(10);

      expect(cloudinary.deleteFile).not.toHaveBeenCalled();
      expect(repo.deleteByProductId).not.toHaveBeenCalled();
    });

    it('should skip images without publicId', async () => {
      repo.findByProductId.mockResolvedValue([
        { publicId: null },
        { publicId: 'img2' },
      ]);

      await useCase.byProductId(10);

      expect(cloudinary.deleteFile).toHaveBeenCalledTimes(1);
      expect(cloudinary.deleteFile).toHaveBeenCalledWith('img2');
    });
  });
});