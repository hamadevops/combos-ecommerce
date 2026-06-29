import { Module } from '@nestjs/common';
import { CacheViewerController } from './cache-viewer.controller';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [CustomCacheModule],
  controllers: [CacheViewerController],
})
export class CacheViewerModule {}
