export type SavedProductWithRelations = {
  id: number;
  saved_at: Date;
  product: {
    id: number;
    title: string;
    price: number;
    productimage: { imageUrl: string | null }[];
    subcategory?: {
      category?: {
        categorytranslation?: { name: string }[];
      };
      subcategorytranslation?: { name: string }[];
    };
    listing_type?: {
      listing_type_translation?: { name: string }[];
    };
    city?: {
      name?: string;
      country?: { name?: string };
    };
    user?: { username?: string };
  };
};
