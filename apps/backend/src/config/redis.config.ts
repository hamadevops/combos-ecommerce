import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';

export const redisConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST');
    const port = configService.get<number>('REDIS_PORT');
    const password = configService.get<string>('REDIS_PASSWORD') ?? '';
    const db = configService.get<number>('REDIS_DB_NUMBER_CACHE');

    return {
      ttl: 60000,
      stores: [
        new KeyvRedis(
          `redis://:${encodeURIComponent(password)}@${host}:${port}/${db}`,
        ),
      ],
    };
  },
  inject: [ConfigService],
};
