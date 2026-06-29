import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppRequest } from '../interfaces/request.interface';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: AppRequest, res: Response, next: NextFunction) {
    const ip =
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';
    const traceId = uuidv4();
    req.traceId = traceId;
    req.clientIp = ip;
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    req.userAgent = userAgent;
    res.setHeader('X-Client-IP', ip);
    res.setHeader('X-Trace-Id', traceId);
    next();
  }
}
