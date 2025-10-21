import { Module } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { FiltersController } from './filters.controller';
import { CategoryRepository } from '../repositories/category/category.repository';
import { ListingTypeRepo } from '../repositories/listingtype/listingtype.repository';
import { AttributeRepo } from '../repositories/attributes/attributes.repository';
import { AppCacheModule } from '../cache/cache.module';
import { LoationRepository } from '../repositories/location/location.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AppCacheModule , AuthModule],
  controllers: [FiltersController],
  providers: [
    FiltersService,
    CategoryRepository,
    ListingTypeRepo,
    AttributeRepo,
    LoationRepository,
  
    // PrismaService,
  ],
})
export class FiltersModule {}