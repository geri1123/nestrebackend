import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';
 
interface CacheEntry<T> {
  data: T;
  setAt: number;
  ttl: number;
}
 
const CACHE_PREFIX = 'cache:';
const LOCK_PREFIX = 'cache:lock:';
 
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private inFlight = new Map<string, Promise<any>>();
  private refreshers = new Map<string, { fn: () => Promise<any>; ttl: number }>();
 
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}
 
  // ─── Read ────────────────────────────────────────────────────────────────
 
  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.redis.get(CACHE_PREFIX + key);
    if (!raw) {
      console.log(`[CACHE MISS ] ${key}`);
      return undefined;
    }
 
    let entry: CacheEntry<T>;
    try {
      entry = JSON.parse(raw);
    } catch {
      this.logger.warn(`Corrupt entry for ${key}, dropping`);
      await this.redis.del(CACHE_PREFIX + key).catch(() => {});
      return undefined;
    }
 
    const remaining = entry.ttl - (Date.now() - entry.setAt);
    console.log(
      `[CACHE HIT  ] ${key} (remaining ${Math.round(remaining / 1000)}s)`,
    );
 
    if (remaining < entry.ttl * 0.15) {
      console.log(`[CACHE STALE] ${key} → kicking off background refresh`);
      this.backgroundRefresh(key);
    }
    return entry.data;
  }
 
  // ─── Write ───────────────────────────────────────────────────────────────
 
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = { data: value, setAt: Date.now(), ttl };
    await this.redis.set(CACHE_PREFIX + key, JSON.stringify(entry), 'PX', ttl);
    console.log(`[CACHE SET  ] ${key} (ttl ${Math.round(ttl / 1000)}s)`);
  }
 
  async delete(key: string): Promise<void> {
    await this.redis.del(CACHE_PREFIX + key);
    console.log(`[CACHE DEL  ] ${key}`);
  }
 
  async clear(): Promise<void> {
    let cursor = '0';
    let deleted = 0;
    do {
      const [next, batch] = await this.redis.scan(
        cursor,
        'MATCH',
        `${CACHE_PREFIX}*`,
        'COUNT',
        500,
      );
      cursor = next;
      if (batch.length > 0) {
        deleted += batch.length;
        await this.redis.del(...batch);
      }
    } while (cursor !== '0');
    this.logger.log(`Cache cleared (${deleted} keys removed)`);
  }
 
  // ─── getOrSet — read-through with two-layer stampede protection ──────────
 
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    if (this.inFlight.has(key)) {
      console.log(`[CACHE COAL ] ${key} → joining same-pod in-flight request`);
      return this.inFlight.get(key)!;
    }
 
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
 
    if (this.inFlight.has(key)) {
      console.log(`[CACHE COAL ] ${key} → joining same-pod in-flight request`);
      return this.inFlight.get(key)!;
    }
 
    const promise = this.fetchWithDistributedLock(key, fetcher, ttl).finally(
      () => this.inFlight.delete(key),
    );
    this.inFlight.set(key, promise);
    return promise;
  }
 
  private async fetchWithDistributedLock<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const lockKey = LOCK_PREFIX + key;
    const lockTtl = 10_000;
 
    const acquired = await this.redis.set(lockKey, '1', 'PX', lockTtl, 'NX');
 
    if (acquired === 'OK') {
      console.log(`[CACHE FETCH] ${key} → calling fetcher (DB hit)`);
      try {
        const value = await fetcher();
        await this.set(key, value, ttl);
        return value;
      } finally {
        await this.redis.del(lockKey).catch(() => {});
      }
    }
 
    console.log(
      `[CACHE WAIT ] ${key} → another pod is fetching, polling cache...`,
    );
    const start = Date.now();
    while (Date.now() - start < lockTtl) {
      await new Promise((r) => setTimeout(r, 50));
      const v = await this.get<T>(key);
      if (v !== undefined) return v;
    }
 
    console.log(
      `[CACHE WARN ] ${key} → lock timeout, fetching as fallback`,
    );
    return fetcher();
  }
 
  // ─── Background refresh ──────────────────────────────────────────────────
 
  registerRefresher<T>(key: string, fn: () => Promise<T>, ttl: number) {
    this.refreshers.set(key, { fn, ttl });
  }
 
  private backgroundRefresh(key: string) {
    if (this.inFlight.has(key)) return;
 
    const refresher = this.refreshers.get(key);
    if (!refresher) return;
 
    console.log(`[CACHE BGRF ] ${key} → background refresh starting (DB hit)`);
    const promise = refresher
      .fn()
      .then((value) => this.set(key, value, refresher.ttl))
      .catch(async (err) => {
        this.logger.error(`Refresh error for ${key}: ${err.message}`);
        await new Promise((r) => setTimeout(r, 5000));
        return refresher
          .fn()
          .then((value) => this.set(key, value, refresher.ttl))
          .catch((e) =>
            this.logger.error(`Refresh retry failed for ${key}: ${e.message}`),
          );
      })
      .finally(() => this.inFlight.delete(key));
 
    this.inFlight.set(key, promise);
  }
}