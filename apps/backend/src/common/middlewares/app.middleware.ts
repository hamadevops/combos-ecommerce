import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { platform } from 'node:os';
import { AppRequest } from '../interfaces/request.interface';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AppMiddleware.name);
  use(req: AppRequest, res: Response, next: NextFunction) {
    req.on('close', () => {
      const traceId = req.traceId ?? 'unknown-trace';
      const clientIp = req.clientIp ?? req.ip ?? 'unknown-ip';
      const agent =
        req.userAgent ??
        (req.headers['user-agent'] as string) ??
        'unknown-agent';
      this.logger.log({
        timestamp: new Date().toISOString(),
        ip: clientIp,
        agent: agent,
        traceId,
        code: res.statusCode,
        method: req.method,
        url: req.originalUrl,
        host: req.headers.host,
        origin: req.headers.origin,
        referrer: req.headers.referer,
        platform: (req.headers['sec-ch-ua-platform'] as string) || platform(),
      });
    });

    next();
  }
}
