import { Module } from '@nestjs/common';
import { FiltersService } from '../filters/filters.service';
import { FiltersController } from './filters.controller';
import { CategoryRepository } from './repositories/category/category.repository';
import { ListingTypeRepo } from './repositories/listingtype/listingtype.repository';
import { AttributeRepo } from './repositories/attributes/attributes.repository';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { LoationRepository } from './repositories/location/location.repository';


@Module({
  imports: [AppCacheModule ],
  controllers: [FiltersController],
  providers: [
    FiltersService,
    CategoryRepository,
    ListingTypeRepo,
    AttributeRepo,
    LoationRepository,
  
    
  ],
  exports:[AttributeRepo]
})
export class FiltersModule {}