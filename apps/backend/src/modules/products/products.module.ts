import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TierVariationsController } from './tier-variations.controller';
import { TierVariationsService } from './tier-variations.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Product } from 'src/database/entities/product.entity';
import { ProductImage } from 'src/database/entities/product-image.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { ProductTierVariation } from 'src/database/entities/product-tier-variation.entity';
import { TierOption } from 'src/database/entities/tier-option.entity';
import { VariantTierIndex } from 'src/database/entities/variant-tier-index.entity';

import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    UploadModule,
    MikroOrmModule.forFeature([
      Product,
      ProductImage,
      ProductVariant,
      ProductTierVariation,
      TierOption,
      VariantTierIndex,

    ]),
  ],
  controllers: [ProductsController, TierVariationsController],
  providers: [ProductsService, TierVariationsService],
})
export class ProductsModule { }
