import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ProductClick,
  ProductClickDocument,
} from './schemas/product_clicks.schema';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ProductClicksService {
  private readonly logger = new Logger(ProductClicksService.name);

  // De-dupe window: same user / IP clicking same product within this window
  // is treated as ONE click. Stops bots & accidental double-clicks.
  private readonly DEDUPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectModel(ProductClick.name)
    private productClickModel: Model<ProductClickDocument>,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Postgres = burimi i vërtetë për numrin total.
   * Mongo = log analitik me një dokument për çdo klikim (për chart historik).
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

    // 1) De-dupe check (Mongo) — skip if same user/ip clicked recently
    const dedupeWindow = new Date(Date.now() - this.DEDUPE_WINDOW_MS);
    try {
      const recent = await this.productClickModel
        .findOne({
          productId,
          $or: [{ userId }, { ipAddress: ip }],
          createdAt: { $gte: dedupeWindow },
        })
        .select({ _id: 1 })
        .lean()
        .exec();

      if (recent) {
        // Duplicate click within window — silently skip
        return;
      }
    } catch (err) {
      // Mongo down? Log but proceed — Postgres is source of truth
      this.logger.error('Mongo dedupe check failed', err);
    }

    // 2) Postgres — increment counter (source of truth)
    await this.prisma.product.update({
      where: { id: numericId },
      data: { clickCount: { increment: 1 } },
    });

    // 3) Mongo — one document per click for historical analytics
    try {
      await this.productClickModel.create({
        productId,
        userId,
        ipAddress: ip,
        userAgent,
        count: 1,
      });
    } catch (err) {
      this.logger.error(
        `Mongo analytics log failed for product ${productId}`,
        err,
      );
      // Don't throw — Postgres already updated, click is counted
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
   * Të dhënat e detajuara të klikimeve nga Mongo për një produkt.
   */
  async getAnalyticsByProduct(productId: string) {
    return this.productClickModel.find({ productId }).exec();
  }

  /**
   * Klikime për ditë për një listë produktesh në një periudhë.
   * Përdoret nga dashboard për grafikun 7-ditësh.
   */
  async getClicksPerDay(
    productIds: string[],
    days: number,
  ): Promise<{ date: string; clicks: number }[]> {
    // Build the timeline first (with zeros) — guarantees every day shows
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dayMap = new Map<string, number>();
    const timeline: { date: string; clicks: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dayMap.set(key, 0);
      timeline.push({ date: key, clicks: 0 });
    }

    if (productIds.length === 0) return timeline;

    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    try {
      const agg = await this.productClickModel
        .aggregate<{ _id: string; total: number }>([
          {
            $match: {
              productId: { $in: productIds },
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              total: { $sum: '$count' },
            },
          },
        ])
        .exec();

      for (const bucket of agg) {
        if (dayMap.has(bucket._id)) {
          dayMap.set(bucket._id, bucket.total);
        }
      }
    } catch (err) {
      this.logger.error('Failed to aggregate clicks per day', err);
      // Return zeros on failure — don't break dashboard
    }

    return timeline.map((d) => ({
      date: d.date,
      clicks: dayMap.get(d.date) ?? 0,
    }));
  }

  /**
   * Aggregate për dashboard analytics.
   */
  async getAnalyticsAggregate(productId: string) {
    return this.productClickModel
      .aggregate([
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
      ])
      .exec();
  }
}