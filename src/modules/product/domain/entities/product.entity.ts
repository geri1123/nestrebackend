export class Product {
  private constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly price: number,
    public readonly cityId: number,
    public readonly subcategoryId: number,
    public readonly listingTypeId: number,
    public readonly userId: number,
    public readonly description: string,
    public readonly streetAddress: string,
    public readonly area?: number,
    public readonly buildYear?: number,
    public readonly status: 'active' | 'inactive' | 'sold' | 'pending' | 'draft' = 'draft',
    public readonly agencyId?: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    id?: number;
    title: string;
    price: number;
    cityId: number;
    subcategoryId: number;
    listingTypeId: number;
    userId: number;
    description?: string;
    streetAddress?: string;
    area?: number;
    buildYear?: number;
    status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft';
    agencyId?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Product {
    return new Product(
      data.id || 0,
      data.title,
      data.price,
      data.cityId,
      data.subcategoryId,
      data.listingTypeId,
      data.userId,
      data.description || '',
      data.streetAddress || '',
      data.area,
      data.buildYear,
      data.status || 'draft',
      data.agencyId,
      data.createdAt,
      data.updatedAt
    );
  }

  static createForUpdate(data: {
    id: number;
    title?: string;
    price?: number;
    description?: string;
    streetAddress?: string;
    area?: number;
    buildYear?: number;
    status?: 'active' | 'inactive' | 'sold' | 'pending' | 'draft';
  }): Partial<Product> {
    return {
      id: data.id,
      title: data.title,
      price: data.price,
      description: data.description,
      streetAddress: data.streetAddress,
      area: data.area,
      buildYear: data.buildYear,
      status: data.status
    };
  }

  toResponse() {
    return {
      id: this.id,
      title: this.title,
      price: this.price,
      cityId: this.cityId,
      subcategoryId: this.subcategoryId,
      listingTypeId: this.listingTypeId,
      userId: this.userId,
      description: this.description,
      streetAddress: this.streetAddress,
      area: this.area,
      buildYear: this.buildYear,
      status: this.status,
      agencyId: this.agencyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}