import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductClick , ProductClickDocument } from './schemas/product_clicks.schema';

@Injectable()
export class ProductClicksService {
  constructor(
    @InjectModel(ProductClick.name) private productClickModel: Model<ProductClickDocument>,
  ) {}

  async addClick(productId: string, userId: string, ip?: string, userAgent?: string) {
    const click = new this.productClickModel({ productId, userId, ipAddress: ip, userAgent });
    return click.save(); 
  }

  async getClicksByProduct(productId: string) {
    return this.productClickModel.find({ productId }).exec();
  }

 async incrementClick(
  productId: string,
  userId: string,
  ip: string,
  userAgent?: string
) {
  return this.productClickModel.findOneAndUpdate(
    { productId, userId, ipAddress: ip }, 
    {
      $inc: { count: 1 },
      $setOnInsert: {
        userAgent,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );
}
async getClicksForProducts(productIds: (string | number)[]) {
  if (!productIds || productIds.length === 0) return new Map<string, number>();

  // Ensure strings because productId in Mongo schema is string
  const ids = productIds.map(String);

  const clicks = await this.productClickModel.aggregate([
    { $match: { productId: { $in: ids } } },
    { $group: { _id: "$productId", totalClicks: { $sum: "$count" } } }
  ]).exec();

  const map = new Map<string, number>();
  for (const c of clicks) {
    map.set(String(c._id), c.totalClicks || 0);
  }
  return map;
}
}