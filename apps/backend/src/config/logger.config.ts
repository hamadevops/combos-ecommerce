import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('Ecommerce-App', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      dirname: 'logs', // Thư mục lưu log
      filename: 'application-%DATE%.log', // Tên file: application-2023-10-27.log
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Nén file log cũ
      maxSize: '20m', // Dung lượng tối đa mỗi file
      maxFiles: '14d', // Chỉ giữ log trong 14 ngày
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(), // Lưu dạng JSON có cấu trúc
      ),
    }),

    // 3. Log Error riêng biệt (Lưu riêng lỗi để dễ debug)
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error', // Chỉ lưu log level error
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
