import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { redisConfig } from '../../config/redis.config';

@Global()
@Module({
  imports: [CacheModule.registerAsync(redisConfig)],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class CustomCacheModule {}
