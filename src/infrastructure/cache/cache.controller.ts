import { Controller, Get } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { Public } from "../../common/decorators/public.decorator";
@Public()
@Controller()
export class ClearCache{
    constructor( private readonly cacheService:CacheService){

    }

    @Get('flush-cache')
async flushCache() {
  await this.cacheService.clear();
  return { success: true };
}
}