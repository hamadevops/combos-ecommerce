import { createParamDecorator } from '@nestjs/common';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export const MultipartBody = <T>(dto: ClassConstructor<T>) =>
  createParamDecorator((_, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    delete req.body.files;
    return plainToInstance(dto, req.body);
  })();
