import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppSwaggerModule } from './modules/swagger/swagger.module';
import { MikroORM } from '@mikro-orm/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import compression from 'compression';
import helmet from 'helmet';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { winstonConfig } from './config/logger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DatabaseSeeder } from './database/seeders/DatabaseSeeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });
  const reflector = app.get(Reflector);
  app.useGlobalGuards();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: String(process.env.FRONTEND_URL_CORS).split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma', 'Expires'],
  });
  app.use(helmet());
  app.use(
    compression({
      level: 9,
      threshold: 10 * 1024,
    }),
  );
  await AppSwaggerModule.setup(app);
  app.enableShutdownHooks();

  const orm = app.get(MikroORM);
  const configService = app.get(ConfigService);
  const env = configService.get<string>('NODE_ENV');
  if (env === 'production') {
    const migrator = orm.getMigrator();
    const pending = await migrator.getPendingMigrations();

    if (pending.length > 0) {
      console.log(
        `Found ${pending.length} pending migrations. Running migrations...`,
      );
      await migrator.up();
      console.log('Migrations completed!');
    }

    console.log('Running database seeders...');
    const seeder = orm.getSeeder();
    await seeder.seed(DatabaseSeeder);
    console.log('Database seeding completed!');
  }

  await app.listen(process.env.PORT ?? 3333);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
