import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductClick, ProductClickDocument } from './schemas/product_clicks.schema';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ProductClicksService {
  private readonly logger = new Logger(ProductClicksService.name);

  constructor(
    @InjectModel(ProductClick.name) private productClickModel: Model<ProductClickDocument>,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Postgres = source of truth për numrin. Duhet të suksesojë.
   * Mongo = log analitik. Dështimi NUK bllokon klikimin.
   */
  async incrementClick(
    productId: string,
    userId: string,
    ip: string,
    userAgent?: string,
  ) {
    const numericId = Number(productId);
    if (isNaN(numericId)) {
      throw new Error(`Invalid productId: ${productId}`);
    }

    // 1) Postgres — burimi i vërtetë
    await this.prisma.product.update({
      where: { id: numericId },
      data: { clickCount: { increment: 1 } },
    });

    // 2) Mongo — vetëm analytics, soft-fail
    try {
      await this.productClickModel.findOneAndUpdate(
        { productId, userId, ipAddress: ip },
        {
          $inc: { count: 1 },
          $setOnInsert: { userAgent, createdAt: new Date() },
        },
        { upsert: true, new: true },
      );
    } catch (err) {
      this.logger.error(
        `Mongo analytics log failed for product ${productId}`,
        err,
      );
    }
  }

  /**
   * Numri i klikimeve për një produkt të vetëm — nga Postgres.
   */
  async getClickCount(productId: number | string): Promise<number> {
    const id = Number(productId);
    if (isNaN(id)) return 0;

    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { clickCount: true },
    });
    return product?.clickCount ?? 0;
  }

  /**
   * Numri i klikimeve për shumë produkte — nga Postgres.
   * Përdoret nga search/listings.
   */
  async getClicksForProducts(
    productIds: (string | number)[],
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (!productIds || productIds.length === 0) return map;

    const ids = productIds
      .map((id) => Number(id))
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return map;

    const products = await this.prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, clickCount: true },
    });

    for (const p of products) {
      map.set(String(p.id), p.clickCount ?? 0);
    }
    return map;
  }

  /**
   * Të dhënat e detajuara të klikimeve nga Mongo.
   * Përdor VETËM për analytics (jo për count).
   */
  async getAnalyticsByProduct(productId: string) {
    return this.productClickModel.find({ productId }).exec();
  }

  /**
   * Aggregate për dashboard analytics.
   * Përdor VETËM për analytics.
   */
  async getAnalyticsAggregate(productId: string) {
    return this.productClickModel.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: '$productId',
          totalClicks: { $sum: '$count' },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueIPs: { $addToSet: '$ipAddress' },
        },
      },
      {
        $project: {
          totalClicks: 1,
          uniqueUserCount: { $size: '$uniqueUsers' },
          uniqueIpCount: { $size: '$uniqueIPs' },
        },
      },
    ]).exec();
  }
}