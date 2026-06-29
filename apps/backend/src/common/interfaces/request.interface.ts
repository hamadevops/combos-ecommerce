import { Request } from 'express';

export interface AppRequest extends Request {
  traceId?: string;
  clientIp?: string;
  userAgent?: string;
  user?: any;
}
