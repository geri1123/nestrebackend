export type ProductImageEntity = {
  imageUrl: string | null;
};

export type ProductEntity = {
  id: number;
  title: string;
  price: number;
  city?: { name: string };
  createdAt: Date;
  productimage: ProductImageEntity[];
  subcategory?: {
    subcategorytranslation?: { name: string }[];
    category?: {
      categorytranslation?: { name: string }[];
    };
  };
  listing_type?: {
    listing_type_translation?: { name: string }[];
  };
  agency?: {
    agency_name?: string;
    logo?: string | null;
  } | null;
};