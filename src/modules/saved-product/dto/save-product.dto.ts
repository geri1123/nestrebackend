export class SavedProductImage {
  imageUrl!: string | null;
}

export class SavedProductAgency {
  agencyName!: string | null;
  logo!: string | null;
}

export class SavedProductAdvertisement {
  id!: number;
  status!: string;
}

export class SavedProductDto {
  id!: number;
  title!: string;
  price!: number;
  categoryName!: string | null;
  subcategoryName!: string | null;
  listingTypeName!: string | null;
  area!: number | null;
  createdAt!: Date;
  city!: string | null;
  country!: string | null;
  user!: { username: string | null };
  image!: SavedProductImage[];
  agency!: SavedProductAgency | null;
  savedAt!: string | null;

  userId!: number;
  agencyId!: number | null;
  isAdvertised!: boolean;
  advertisement!: SavedProductAdvertisement | null;
  totalClicks!: number;
}

export class PaginatedSavedProductsDto {
  products!: SavedProductDto[];
  totalCount!: number;
  currentPage!: number;
  totalPages!: number;
}