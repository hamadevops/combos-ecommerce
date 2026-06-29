import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { platform } from 'node:os';
import { sanitizeData } from '../utils/sanitize.util';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // 1. Khởi tạo Logger (Nó sẽ dùng cấu hình Winston đã setup)
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 500;
    let errors: { field?: string; message: string }[] = [];

    // 2. Phân loại lỗi (HttpException vs System Error)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status;
      const res: any = exception.getResponse();

      if (typeof res === 'object') {
        message = res.message || message;

        // Xử lý lỗi từ Class Validator (trả về mảng string)
        if (Array.isArray(res.message)) {
          errors = res.message.map((msg: string) => ({
            field: this.extractFieldFromMessage(msg),
            message: msg,
          }));
        } else {
          errors = [{ message }];
        }
      } else {
        message = res;
        errors = [{ message }];
      }
    } else if (exception instanceof Error) {
      // Nếu là lỗi hệ thống (Code lỗi, DB lỗi...)
      message = exception.message; // Có thể ẩn message này ở Production nếu muốn
    }

    // 3. Lấy thông tin Context
    const traceId = (request as any).traceId || 'unknown-trace';
    const clientIp = (request as any).clientIp || request.ip || 'unknown-ip';
    const agent =
      (request as any).userAgent ||
      request.headers['user-agent'] ||
      'unknown-agent';

    // 4. Ghi Log thông qua Winston (Thay thế đoạn dùng fs thủ công)
    // Winston sẽ tự động lưu cái object này vào file logs/error-YYYY-MM-DD.log dạng JSON
    this.logger.error({
      timestamp: new Date().toISOString(),
      ip: clientIp,
      agent: agent,
      traceId,
      code,
      method: request.method,
      url: request.originalUrl,
      message: message,
      host: request.headers.host,
      origin: request.headers.origin,
      referrer: request.headers.referer,
      platform: request.headers['sec-ch-ua-platform'] || platform(),
      body: sanitizeData(request.body), // Hàm lọc thông tin nhạy cảm
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // 5. Trả Response về Client
    response.status(status).json({
      traceId,
      status: false, // Luôn là false khi vào Exception Filter
      message,
      code,
      errors: errors.length > 0 ? errors : null,
    });
  }

  // Regex lấy tên field từ message lỗi (VD: "email must be an email" -> "email")
  private extractFieldFromMessage(msg: string): string {
    const regex = /^([a-zA-Z0-9_.]+)\s/;
    const match = regex.exec(msg);
    return match ? match[1] : '';
  }
}
