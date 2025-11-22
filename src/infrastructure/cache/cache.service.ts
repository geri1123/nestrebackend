import Keyv from "keyv";
import { CACHE_KEYV } from "./cache.constants";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_KEYV) private cache: Keyv) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    return this.cache.set(key, value, ttl);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }
}