import { Controller, Get } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Public } from '../../common/decorators/public.decorator';
 
@Public()
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}
 
  // Hit GET /cache/flush to wipe every key under the `cache:` prefix.
  // Counts and queue data are unaffected.
  @Get('flush')
  async flush() {
    await this.cacheService.clear();
    return { success: true };
  }
}
 