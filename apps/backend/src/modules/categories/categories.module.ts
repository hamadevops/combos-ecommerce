import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from 'src/database/entities/category.entity';
import { ProductCategory } from 'src/database/entities/product-category.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Category, ProductCategory]),
    UploadModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
