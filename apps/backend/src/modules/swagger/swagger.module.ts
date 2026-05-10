import { INestApplication, Module } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppSwaggerTag } from './swagger.constant';

@Module({})
export class AppSwaggerModule {
  static setup(app: INestApplication) {
    const initialConfig = new DocumentBuilder()
      .setTitle('HUKAN Shop API')
      .setDescription('HUKAN SHOP API documents')
      .setVersion('1.0')
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
