import { product_status } from "../types/product-status.type";

export class ProductEntity {
  constructor(
    public readonly id: number | null,
    public title: string,
    public price: number,
    public readonly cityId: number,
    public readonly subcategoryId: number,
    public readonly listingTypeId: number,
    public description: string,
    public streetAddress: string,
    public area: number | null,
    public buildYear: number | null,
    public status: product_status,
    public readonly userId: number,
    public readonly agencyId: number | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(data: {
    title: string;
    price: number;
    cityId: number;
    subcategoryId: number;
    listingTypeId: number;
    description?: string;
    streetAddress?: string;
    area?: number;
    buildYear?: number;
    status?: product_status;
    userId: number;
    agencyId?: number;
  }): ProductEntity {
    return new ProductEntity(
      null,
      data.title,
      data.price,
      data.cityId,
      data.subcategoryId,
      data.listingTypeId,
      data.description || '',
      data.streetAddress || '',
      data.area ?? null,
      data.buildYear ?? null,
      data.status || 'draft',
      data.userId,
      data.agencyId ?? null,
    );
  }

  update(data: {
    title?: string;
    price?: number;
    description?: string;
    streetAddress?: string;
    area?: number;
    buildYear?: number;
    status?: product_status;
  }): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.price !== undefined) this.price = data.price;
    if (data.description !== undefined) this.description = data.description;
    if (data.streetAddress !== undefined) this.streetAddress = data.streetAddress;
    if (data.area !== undefined) this.area = data.area;
    if (data.buildYear !== undefined) this.buildYear = data.buildYear;
    if (data.status !== undefined) this.status = data.status;
  }

  canBeViewedBy(viewerUserId: number | undefined, viewerAgencyId: number | undefined, viewerRole: string | undefined): boolean {
    if (this.status === 'active') return true;
    if (viewerUserId === this.userId) return true;
    if (viewerRole === 'agency_owner' && viewerAgencyId === this.agencyId) return true;
    return false;
  }
}