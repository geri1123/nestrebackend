
import { DeleteProductImagesByProductIdUseCase } from "../delete-product-images.use-case";
describe('DeleteProductImagesByProductIdUseCase', () => {
  let useCase: DeleteProductImagesByProductIdUseCase;

  const repo = {
    findByProductId: jest.fn(),
    deleteByProductId: jest.fn(),
  } as any;

  const cloudinary = {
    deleteFile: jest.fn(),
  } as any;

  beforeEach(() => {
  jest.clearAllMocks();

  useCase = new DeleteProductImagesByProductIdUseCase(
    repo,
    cloudinary,
  );
});
  it('should delete images from cloudinary and repository when images exist', async () => {
    repo.findByProductId.mockResolvedValue([
      { publicId: 'img1' },
      { publicId: 'img2' },
    ]);

    await useCase.execute(10);

    expect(cloudinary.deleteFile).toHaveBeenCalledTimes(2);
    expect(cloudinary.deleteFile).toHaveBeenCalledWith('img1');
    expect(cloudinary.deleteFile).toHaveBeenCalledWith('img2');

    expect(repo.deleteByProductId).toHaveBeenCalledWith(10);
  });

  it('should not call delete when no images exist', async () => {
    repo.findByProductId.mockResolvedValue([]);

    await useCase.execute(10);

    expect(cloudinary.deleteFile).not.toHaveBeenCalled();
    expect(repo.deleteByProductId).not.toHaveBeenCalled();
  });
});