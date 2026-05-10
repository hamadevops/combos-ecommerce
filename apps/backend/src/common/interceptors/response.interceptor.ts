import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CUSTOM_MESSAGE } from '../decorators/custom-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message =
      this.reflector.get<string>(CUSTOM_MESSAGE, context.getHandler()) ||
      'Success';

    return next.handle().pipe(
      map((result) => {
        if (result?.items && !!result?.meta) {
          const { items, meta } = result;

          return {
            traceId: context.switchToHttp().getRequest().traceId,
            success: true,
            message,
            data: items,
            meta: meta,
          };
        }

        if (Array.isArray(result)) {
          return {
            traceId: context.switchToHttp().getRequest().traceId,
            success: true,
            message,
            data: result,
            meta: null,
          };
        }

        return {
          traceId: context.switchToHttp().getRequest().traceId,
          success: true,
          message,
          data: result,
          meta: null,
        };
      }),
    );
  }
}
