import { Module } from '@nestjs/common';
import { FiltersService } from '../filters/filters.service';
import { FiltersController } from './filters.controller';
import { CategoryRepository } from './repositories/category/category.repository';
import { ListingTypeRepo } from './repositories/listingtype/listingtype.repository';
import { AttributeRepo } from './repositories/attributes/attributes.repository';

import { LoationRepository } from './repositories/location/location.repository';
import { CATEGORY_REPO } from './repositories/category/Icategory.repository';
import { LISTING_TYPE_REPO } from './repositories/listingtype/Ilistingtype.repository';
import { LOCATION_REPO } from './repositories/location/Ilocation.repository';
import { ATTRIBUTE_REPO } from './repositories/attributes/Iattribute.respository';
import { PRODUCT_COUNTS_REPO } from './repositories/counts/Iproduct-counts.repository';
import { ProductCountsRepository } from './repositories/counts/product-counts.repository';

@Module({
 
  controllers: [FiltersController],
  providers: [
    FiltersService,
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
      provide: ATTRIBUTE_REPO,
      useClass: AttributeRepo,
    },
    {
      provide: PRODUCT_COUNTS_REPO,
      useClass: ProductCountsRepository,
    },
  ],
  // Export the repos the queue processor needs, plus the service used by other modules.
  exports: [
    ATTRIBUTE_REPO,
    FiltersService,
    LOCATION_REPO,
    CATEGORY_REPO,
    LISTING_TYPE_REPO,
    PRODUCT_COUNTS_REPO,
  ],
})
export class FiltersModule {}