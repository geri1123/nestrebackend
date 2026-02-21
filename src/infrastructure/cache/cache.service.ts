import Keyv from "keyv";
import { CACHE_KEYV } from "./cache.constants";
import { Inject, Injectable } from "@nestjs/common";
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_KEYV) private cache: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.cache.get(key);
    if (value) {
      console.log(`[Cache HIT] Key: ${key}`);
    } else {
      console.log(`[Cache MISS] Key: ${key}`);
    }
    return value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    console.log(`[Cache SET] Key: ${key}, TTL: ${ttl}`);
    return this.cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<boolean> {
    console.log(`[Cache DELETE] Key: ${key}`);
    return this.cache.delete(key);
  }
  async clear(): Promise<void> {
  await this.cache.clear();
}
}

