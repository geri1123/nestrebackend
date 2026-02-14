import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserUpdatedEvent } from '../../events/user-updated.event';
import { CacheService } from '../../../../infrastructure/cache/cache.service';

@Injectable()
export class UserCacheInvalidationListener {
  constructor(private readonly cacheService: CacheService) {}

  @OnEvent('user.updated')
  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const cacheKey = `ctx:${event.userId}`;
    
    console.log(`[Event] User ${event.userId} updated. Fields:`, event.updatedFields);
    console.log(`[Event] Invalidating cache key: ${cacheKey}`);
    
    await this.cacheService.delete(cacheKey);
    
    console.log(`[Event] Cache invalidated successfully for user ${event.userId}`);
  }
}