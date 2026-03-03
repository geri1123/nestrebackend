

import Keyv from "keyv";
import { CACHE_KEYV } from "./cache.constants";
import { Inject, Injectable } from "@nestjs/common";

interface CacheEntry<T> {
  data: T;
  setAt: number;
  ttl: number;
}

@Injectable()
export class CacheService {
  
  private inFlight = new Map<string, Promise<any>>();

  constructor(@Inject(CACHE_KEYV) private cache: Keyv) {}


   // If TTL is near end, triggers background refresh using the refresher fn.
   // Returns stale data immediately while refresh happens in background.
  
  async get<T>(key: string): Promise<T | undefined> {
    const entry = await this.cache.get<CacheEntry<T>>(key);

    if (!entry) {
      console.log(`[Cache MISS] Key: ${key}`);
      return undefined;
    }

    const age = Date.now() - entry.setAt;
    const remainingTtl = entry.ttl - age;
    const refreshThreshold = entry.ttl * 0.15; 

    if (remainingTtl < refreshThreshold) {
      console.log(`[Cache STALE] Key: ${key} — remaining: ${Math.round(remainingTtl / 1000)}s, triggering background refresh`);
      this.backgroundRefresh(key); 
    } else {
      console.log(`[Cache HIT] Key: ${key} — remaining: ${Math.round(remainingTtl / 1000)}s`);
    }

    return entry.data;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<boolean> {
    const entry: CacheEntry<T> = {
      data: value,
      setAt: Date.now(),
      ttl,
    };
    console.log(`[Cache SET] Key: ${key}, TTL: ${ttl}ms`);
    return this.cache.set(key, entry, ttl);
  }

  
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
  if (this.inFlight.has(key)) {
    console.log(`[Cache COALESCE] Key: ${key} — waiting for in-flight request`);
    return this.inFlight.get(key)!;
  }

  const cached = await this.get<T>(key);
  if (cached !== undefined) return cached;

  if (this.inFlight.has(key)) {
    console.log(`[Cache COALESCE] Key: ${key} — waiting for in-flight request`);
    return this.inFlight.get(key)!;
  }

  const promise = fetcher()
    .then(async (value) => {
      await this.set(key, value, ttl);
      return value;
    })
    .finally(() => {
      this.inFlight.delete(key);
    });

  this.inFlight.set(key, promise);
  return promise;
}

  // Refreshers registry: key -> fetch function + ttl
  private refreshers = new Map<string, { fn: () => Promise<any>; ttl: number }>();

  registerRefresher<T>(key: string, fn: () => Promise<T>, ttl: number) {
    this.refreshers.set(key, { fn, ttl });
  }
private backgroundRefresh(key: string) {
  if (this.inFlight.has(key)) return;

  const refresher = this.refreshers.get(key);
  if (!refresher) return;

  const promise = refresher
    .fn()
    .then((value) => this.set(key, value, refresher.ttl))
    .catch(async (err) => {
      console.error(`[Cache REFRESH ERROR] Key: ${key}`, err);
      await new Promise(r => setTimeout(r, 5000));
      return refresher.fn()
        .then((value) => this.set(key, value, refresher.ttl))
        .catch((e) => console.error(`[Cache REFRESH RETRY FAILED] Key: ${key}`, e));
    })
    .finally(() => this.inFlight.delete(key));

  this.inFlight.set(key, promise);
}

  async delete(key: string): Promise<boolean> {
    console.log(`[Cache DELETE] Key: ${key}`);
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    await this.cache.clear();
  }
}