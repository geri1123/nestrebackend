import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ProductStatus } from '@prisma/client';
import { REDIS_CLIENT } from '../../../../infrastructure/redis/redis.constants';
import { IProductCountsRepository } from './Iproduct-counts.repository';

const SUBCAT_KEY = (status: string) => `subcatCounts:${status}`;
const LT_KEY = (status: string) => `listingTypeCounts:${status}`;
const RECONCILE_LOCK_KEY = 'productCounts:reconcileLock';

/**
 * Counter-based product counts stored as Redis hashes.
 *   subcatCounts:{status}        -> hash: subcategoryId -> count
 *   listingTypeCounts:{status}   -> hash: listingTypeId -> count
 *
 * All hot-path operations are atomic Redis ops. Zero DB hits during
 * create/update/delete. The DB is only touched during reconciliation.
 */
@Injectable()
export class ProductCountsRepository implements IProductCountsRepository {
  private readonly logger = new Logger(ProductCountsRepository.name);

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  // ─── Write deltas (called by the BullMQ worker) ──────────────────────────

  async applyCreate(args: {
    subcategoryId: number;
    listingTypeId: number;
    status: ProductStatus;
  }): Promise<void> {
    const status = String(args.status);
    await this.redis
      .multi()
      .hincrby(SUBCAT_KEY(status), String(args.subcategoryId), 1)
      .hincrby(LT_KEY(status), String(args.listingTypeId), 1)
      .exec();
    console.log(
      `[COUNTS REDIS] CREATE → HINCRBY ${SUBCAT_KEY(status)}[${args.subcategoryId}]+1, HINCRBY ${LT_KEY(status)}[${args.listingTypeId}]+1`,
    );
  }

  async applyStatusChange(args: {
    subcategoryId: number;
    listingTypeId: number;
    oldStatus: ProductStatus;
    newStatus: ProductStatus;
  }): Promise<void> {
    if (args.oldStatus === args.newStatus) return;

    const oldS = String(args.oldStatus);
    const newS = String(args.newStatus);
    await this.redis
      .multi()
      .hincrby(SUBCAT_KEY(oldS), String(args.subcategoryId), -1)
      .hincrby(LT_KEY(oldS), String(args.listingTypeId), -1)
      .hincrby(SUBCAT_KEY(newS), String(args.subcategoryId), 1)
      .hincrby(LT_KEY(newS), String(args.listingTypeId), 1)
      .exec();
    console.log(
      `[COUNTS REDIS] STATUS ${oldS}→${newS} → 4× HINCRBY (sub=${args.subcategoryId}, lt=${args.listingTypeId})`,
    );
  }

  async applyDelete(args: {
    subcategoryId: number;
    listingTypeId: number;
    status: ProductStatus;
  }): Promise<void> {
    const status = String(args.status);
    await this.redis
      .multi()
      .hincrby(SUBCAT_KEY(status), String(args.subcategoryId), -1)
      .hincrby(LT_KEY(status), String(args.listingTypeId), -1)
      .exec();
    console.log(
      `[COUNTS REDIS] DELETE → HINCRBY ${SUBCAT_KEY(status)}[${args.subcategoryId}]-1, HINCRBY ${LT_KEY(status)}[${args.listingTypeId}]-1`,
    );
  }

  // ─── Read paths (called by FiltersService on every /filters request) ─────

  async getSubcategoryCounts(
    status: ProductStatus,
  ): Promise<Record<number, number>> {
    const raw = await this.redis.hgetall(SUBCAT_KEY(String(status)));
    const map = this.toNumberMap(raw);
    console.log(
      `[COUNTS REDIS] HGETALL subcatCounts:${status} → ${Object.keys(map).length} entries (no DB hit)`,
    );
    return map;
  }

  async getListingTypeCounts(
    status: ProductStatus,
  ): Promise<Record<number, number>> {
    const raw = await this.redis.hgetall(LT_KEY(String(status)));
    const map = this.toNumberMap(raw);
    console.log(
      `[COUNTS REDIS] HGETALL listingTypeCounts:${status} → ${Object.keys(map).length} entries (no DB hit)`,
    );
    return map;
  }

  // ─── Reconciliation (DB → Redis swap, hourly + on boot) ──────────────────

  async replaceCounts(args: {
    status: ProductStatus;
    subcategoryCounts: Record<number, number>;
    listingTypeCounts: Record<number, number>;
  }): Promise<void> {
    const status = String(args.status);
    const subKey = SUBCAT_KEY(status);
    const ltKey = LT_KEY(status);

    const subEntries = Object.entries(args.subcategoryCounts);
    const ltEntries = Object.entries(args.listingTypeCounts);

    const subTmp = `${subKey}:tmp:${Date.now()}`;
    const ltTmp = `${ltKey}:tmp:${Date.now()}`;

    const pipeline = this.redis.multi();

    if (subEntries.length > 0) {
      pipeline.hset(
        subTmp,
        ...subEntries.flatMap(([id, count]) => [id, String(count)]),
      );
      pipeline.rename(subTmp, subKey);
    } else {
      pipeline.del(subKey);
    }

    if (ltEntries.length > 0) {
      pipeline.hset(
        ltTmp,
        ...ltEntries.flatMap(([id, count]) => [id, String(count)]),
      );
      pipeline.rename(ltTmp, ltKey);
    } else {
      pipeline.del(ltKey);
    }

    await pipeline.exec();
    this.logger.log(
      `Reconciled counts for status=${status}: subcats=${subEntries.length} listingTypes=${ltEntries.length}`,
    );
  }

  async acquireReconcileLock(ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(
      RECONCILE_LOCK_KEY,
      '1',
      'EX',
      ttlSeconds,
      'NX',
    );
    return result === 'OK';
  }

  async releaseReconcileLock(): Promise<void> {
    await this.redis.del(RECONCILE_LOCK_KEY);
  }

  async isStatusInitialized(status: ProductStatus): Promise<boolean> {
    const exists = await this.redis.exists(SUBCAT_KEY(String(status)));
    return exists === 1;
  }

  private toNumberMap(raw: Record<string, string>): Record<number, number> {
    const out: Record<number, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const n = Number(v);
      if (n > 0) out[Number(k)] = n;
    }
    return out;
  }
}