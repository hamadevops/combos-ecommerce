import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { EntityManager } from '@mikro-orm/mysql';
import { AppRequest } from '../interfaces/request.interface';
import { PageView } from 'src/database/entities/page-view.entity';
import { v4 as uuidv4 } from 'uuid';

// Paths to exclude from tracking
const EXCLUDED_PATHS = [
  '/api/v1/auth',
  '/api/v1/dashboard',
  '/api/v1/upload',
  '/api/v1/cache',
  '/health',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

@Injectable()
export class PageViewMiddleware implements NestMiddleware {
  private readonly logger = new Logger(PageViewMiddleware.name);

  constructor(private readonly em: EntityManager) {}

  use(req: AppRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Call next immediately — never block the response
    next();

    // Fire-and-forget: track after response starts
    this.trackPageView(req, res, startTime).catch((err) => {
      this.logger.error(`PageView tracking failed: ${err.message}`);
    });
  }

  private async trackPageView(req: AppRequest, res: Response, startTime: number) {
    // Only track GET requests
    return;
    if (req.method !== 'GET') return;

    const path = req.originalUrl?.split('?')[0] || req.path;

    // Skip excluded paths
    if (EXCLUDED_PATHS.some((p) => path.startsWith(p))) return;

    // Skip static assets
    if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i.test(path)) return;

    const ua = (req.headers['user-agent'] as string) || '';
    const queryString = req.originalUrl?.split('?')[1] || '';
    const parsedUA = this.parseUserAgent(ua);
    const utmParams = this.extractUTM(queryString);

    // Session ID from cookie or generate new
    const sessionId = req.cookies?._sid || uuidv4();

    // Set session cookie if not present (30 min expiry)
    if (!req.cookies?._sid) {
      res.cookie('_sid', sessionId, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000, // 30 minutes
        sameSite: 'lax',
      });
    }

    const fork = this.em.fork();
    const pageView = fork.create(PageView, {
      sessionId,
      path,
      queryString: queryString || undefined,
      method: 'GET',
      ip: req.clientIp || req.ip || undefined,
      userAgent: ua.substring(0, 500) || undefined,
      referer: ((req.headers['referer'] || req.headers['referrer']) as string)?.substring(0, 500) || undefined,
      deviceType: parsedUA.deviceType,
      browser: parsedUA.browser,
      os: parsedUA.os,
      country: (req.headers['cf-ipcountry'] as string) || undefined,
      utmSource: utmParams.utm_source,
      utmMedium: utmParams.utm_medium,
      utmCampaign: utmParams.utm_campaign,
      responseTimeMs: Date.now() - startTime,
      statusCode: res.statusCode,
      createdAt: new Date(),
    });

    await fork.persistAndFlush(pageView);
  }

  /**
   * Lightweight UA parser — no external dependency
   */
  private parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
    // Device type
    let deviceType = 'desktop';
    if (/Mobile|Android.*Mobile|iPhone|iPod/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
      deviceType = 'tablet';
    }

    // Browser
    let browser = 'Other';
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';

    // OS
    let os = 'Other';
    if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    return { deviceType, browser, os };
  }

  /**
   * Extract UTM parameters from query string
   */
  private extractUTM(queryString: string): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  } {
    if (!queryString) return {};
    const params = new URLSearchParams(queryString);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  }
}
