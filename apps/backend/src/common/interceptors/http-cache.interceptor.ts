import { ExecutionContext, Injectable, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CACHE_TTL_METADATA, CacheInterceptor } from '@nestjs/cache-manager';
import { tap } from 'rxjs/operators';
import * as crypto from 'node:crypto';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') return undefined;

    const userId = request.user?.id ?? 0;
    const method = request.method;
    const url = request.url;
    const rawKey = `${userId}:${method}:${url}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
    return `datacache:${hash}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // lấy TTL và key từ metadata
    const ttl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );
    const key = this.trackBy(context);

    if (!key) return next.handle();

    const cached = await this.cacheManager.get(key);
    if (cached)
      return new Observable((observer) => {
        observer.next(cached);
        observer.complete();
      });

    return next.handle().pipe(
      tap((response) => {
        if (ttl) {
          this.cacheManager.set(key, response, ttl * 1000);
        } else {
          this.cacheManager.set(key, response, 60000);
        }
      }),
    );
  }
}
