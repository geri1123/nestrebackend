export class SavedProductImage{
     imageUrl!: string | null; 
}

export class SavedProductDto {
  id!: number;
  title!: string;
  price!: number;
  categoryName!: string;
  subcategoryName!: string;
  listingTypeName!: string;
  city?: string;
  country?: string;
  user!: { username: string };
  images!: SavedProductImage[];
  savedAt!: string | null
}

export class PaginatedSavedProductsDto {
  products!: SavedProductDto[];
  count!: number;
  currentPage!: number;
  totalPages!: number;
}