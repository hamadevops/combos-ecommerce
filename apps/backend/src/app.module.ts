import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { envValidationSchema } from './config/env.validation';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { TraceMiddleware } from './common/middlewares/trace.middleware';
import { AppMiddleware } from './common/middlewares/app.middleware';
import { PageViewMiddleware } from './common/middlewares/page-view.middleware';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import MikroOrmConfig from './mikro-orm.config';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './modules/cron/cron.service';
import { MailerQueueModule } from './modules/mailer/mail-queue.module';
import { CustomCacheModule } from './modules/cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { ProductsModule } from './modules/products/products.module';
import { PermissionModule } from './modules/permission/permission.module';
import minioConfig from './config/minio.config';
import { UploadModule } from './modules/upload/upload.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { PostsModule } from './modules/posts/posts.module';
import { TagsModule } from './modules/tags/tags.module';
import { PopupsModule } from './modules/popups/popups.module';
import { CacheViewerModule } from './modules/cache-viewer/cache-viewer.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { PagesModule } from './modules/pages/pages.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EmailMarketingModule } from './modules/email-marketing/email-marketing.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { AppFeedbacksModule } from './modules/app-feedbacks/app-feedbacks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [minioConfig],
      validationSchema: envValidationSchema,
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 30, // Nới từ 3 -> 15 (Next.js thường gọi song song nhiều API khi load trang)
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 150, // Tăng lên để user chuyển trang (client-side navigation) mượt mà
      },
      {
        name: 'long',
        ttl: 900000,
        limit: 5000,
      },
    ]),
    MikroOrmModule.forRoot(MikroOrmConfig),
    UserModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    TopicsModule,
    PostsModule,
    TagsModule,
    PopupsModule,
    MailerQueueModule,
    CustomCacheModule,
    PermissionModule,
    CacheViewerModule,
    UploadModule,
    FaqsModule,
    PagesModule,
    SettingsModule,
    ReviewsModule,
    CustomersModule,
    OrdersModule,
    DashboardModule,
    EmailMarketingModule,
    ContactsModule,
    AppFeedbacksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CronService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TraceMiddleware, AppMiddleware, PageViewMiddleware)
      .forRoutes({
        path: '*path',
        method: RequestMethod.ALL,
      });
  }
}
