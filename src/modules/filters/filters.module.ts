import { Module } from '@nestjs/common';
import { FiltersService } from '../filters/filters.service';
import { FiltersController } from './filters.controller';
import { CategoryRepository } from './repositories/category/category.repository';
import { ListingTypeRepo } from './repositories/listingtype/listingtype.repository';
import { AttributeRepo } from './repositories/attributes/attributes.repository';
import { AppCacheModule } from '../../infrastructure/cache/cache.module';
import { LoationRepository } from './repositories/location/location.repository';
import { CATEGORY_REPO } from './repositories/category/Icategory.repository';
import { LISTING_TYPE_REPO } from './repositories/listingtype/Ilistingtype.repository';
import { LOCATION_REPO } from './repositories/location/Ilocation.repository';
import { ATTRIBUTE_REPO } from './repositories/attributes/Iattribute.respository';


@Module({
  imports: [AppCacheModule ],
  controllers: [FiltersController],
  providers: [
    FiltersService,
    CategoryRepository,
    ListingTypeRepo,
    AttributeRepo,
    LoationRepository,
  {
      provide: CATEGORY_REPO,
      useClass: CategoryRepository,
    },
    {
      provide: LISTING_TYPE_REPO,
      useClass: ListingTypeRepo,
    },
     {
      provide: LOCATION_REPO,
      useClass: LoationRepository,
    },
    {
      provide:ATTRIBUTE_REPO,
      useClass:AttributeRepo
    },
  ],
  exports:[AttributeRepo ,ATTRIBUTE_REPO]
})
export class FiltersModule {}