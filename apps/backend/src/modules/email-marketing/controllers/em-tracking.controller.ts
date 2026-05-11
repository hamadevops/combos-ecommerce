import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { Public } from 'src/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { EmTrackingService } from '../services/em-tracking.service';

// 1x1 transparent GIF pixel (43 bytes)
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

@ApiTags('Email Marketing - Tracking')
@Controller('em-tracking')
@SkipThrottle()
export class EmTrackingController {
  private readonly logger = new Logger(EmTrackingController.name);

  constructor(private readonly trackingService: EmTrackingService) {}

  @ApiOperation({ summary: 'Open pixel tracking (trả về ảnh 1x1 GIF)' })
  @Public()
  @Get('open/:logId.gif')
  async trackOpen(@Param('logId') logIdStr: string, @Res() res: Response) {
    const logId = parseInt(logIdStr, 10);
    if (!isNaN(logId)) {
      await this.trackingService.trackOpen(logId);
    }

    // Always return the pixel regardless of errors
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': TRANSPARENT_GIF.length.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.end(TRANSPARENT_GIF);
  }

  @ApiOperation({ summary: 'Click tracking (redirect 302 tới URL gốc)' })
  @Public()
  @Get('click/:hash')
  async trackClick(
    @Param('hash') hash: string,
    @Query('lid') lidStr: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const logId = parseInt(lidStr, 10);
    const ip = (req.ip || req.headers['x-forwarded-for'] || '') as string;
    const userAgent = req.headers['user-agent'] || '';

    const originalUrl = await this.trackingService.trackClick(
      hash,
      logId,
      ip,
      userAgent,
    );

    if (originalUrl) {
      res.redirect(302, originalUrl);
    } else {
      res.status(404).send('Link not found or error occurred');
    }
  }

  @ApiOperation({ summary: 'Unsubscribe contact' })
  @Public()
  @Get('unsubscribe/:contactId/:token')
  async unsubscribe(
    @Param('contactId') contactIdStr: string,
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const contactId = parseInt(contactIdStr, 10);
    const result = await this.trackingService.unsubscribe(contactId, token);

    if (!result.success) {
      res
        .status(result.message === 'Link không hợp lệ' ? 403 : 500)
        .send(result.message);
      return;
    }

    res.send(`
      <html>
      <head><meta charset="utf-8"><title>Hủy đăng ký</title></head>
      <body style="font-family:Arial,sans-serif;text-align:center;padding:50px;">
        <h2>✅ Bạn đã hủy đăng ký nhận email thành công</h2>
        <p>Bạn sẽ không nhận thêm email marketing từ chúng tôi.</p>
      </body>
      </html>
    `);
  }
}
