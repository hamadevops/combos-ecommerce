import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Redis } from 'ioredis';
import { redisConfig } from '../src/config/redis.config';
import { envValidationSchema } from '../src/config/env.validation';

async function bootstrap() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: envValidationSchema,
            }),
            CacheModule.registerAsync(redisConfig),
        ],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    const cacheManager = app.get<Cache>(CACHE_MANAGER);
    const configService = app.get(ConfigService);

    const db = configService.get<number>('REDIS_DB_NUMBER_CACHE');
    console.log(`Configured Redis DB: ${db}`);

    // 1. Set a value via CacheManager
    const testKey = 'test-verification-key';
    const testValue = 'hello-world';
    await cacheManager.set(testKey, testValue);
    console.log(`Set cache key: ${testKey}`);

    // 2. Read direct from Redis
    const host = configService.get<string>('REDIS_HOST');
    const port = configService.get<number>('REDIS_PORT');
    const password = configService.get<string>('REDIS_PASSWORD');

    const redis = new Redis({
        host,
        port,
        password,
        db,
    });

    const keys = await redis.keys('*test-verification-key*');
    console.log('Keys found in Redis (custom client):', keys);

    if (keys.length > 0) {
        const redisKey = keys[0];
        const rawValue = await redis.get(redisKey);
        console.log(`Raw value in Redis for ${redisKey}:`, rawValue);

        // 3. Try to get using CacheManager with the raw key name
        const valViaRaw = await cacheManager.get(redisKey);
        console.log(`Value via CacheManager using raw key '${redisKey}':`, valViaRaw);

        // 4. Try to get using original key name
        const valViaOriginal = await cacheManager.get(testKey);
        console.log(`Value via CacheManager using original key '${testKey}':`, valViaOriginal);
    }

    // 5. Test Raw data compatibility
    const rawKey = 'test-raw-key';
    await redis.set(rawKey, 'raw-value-string');
    const valRawViaManager = await cacheManager.get(rawKey);
    console.log(`Value of raw key '${rawKey}' via CacheManager:`, valRawViaManager);

    const valRawViaRedis = await redis.get(rawKey);
    console.log(`Value of raw key '${rawKey}' via Redis:`, valRawViaRedis);

    await redis.quit();
    await app.close();
}

bootstrap();
