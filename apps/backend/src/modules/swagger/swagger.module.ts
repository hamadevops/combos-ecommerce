import { INestApplication, Module } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppSwaggerTag } from './swagger.constant';

import { EntityManager } from '@mikro-orm/core';
import { Setting } from '../../database/entities/setting.entity';

@Module({})
export class AppSwaggerModule {
  static async setup(app: INestApplication) {
    let title = process.env.SWAGGER_TITLE;
    let description = process.env.SWAGGER_DESCRIPTION;
    const version = process.env.SWAGGER_VERSION || '1.0';

    try {
      const em = app.get(EntityManager);
      const storeName = await em.findOne(Setting, { key: 'store_name' });
      const storeDesc = await em.findOne(Setting, { key: 'store_description' });

      if (!title && storeName?.value) {
        title = `${storeName.value} API`;
      }
      if (!description) {
        if (storeName?.value) {
          description = `Tài liệu kết nối API dành cho hệ thống ${storeName.value}`;
        } else if (storeDesc?.value) {
          description = `Tài liệu API: ${storeDesc.value}`;
        }
      }
    } catch (err) {
      // Fallback if database is not migrated/seeded yet
    }

    title = title || 'Ecommerce API';
    description = description || 'Ecommerce API documents';

    const initialConfig = new DocumentBuilder()
      .setTitle(title)
      .setDescription(description)
      .setVersion(version)
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      });
    for (const tag of Object.values(AppSwaggerTag)) {
      initialConfig.addTag(tag);
    }
    const config = initialConfig.build();
    const removedSuffix = 'Controller';
    const options: SwaggerDocumentOptions = {
      operationIdFactory: (controllerKey: string, methodKey: string) =>
        controllerKey !== removedSuffix && controllerKey.endsWith(removedSuffix)
          ? `${controllerKey.slice(0, -removedSuffix.length)}_${methodKey}`
          : `${controllerKey}_${methodKey}`,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api/docs', app, document);
  }
}
