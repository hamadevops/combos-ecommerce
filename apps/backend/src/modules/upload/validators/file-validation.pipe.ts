import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { FilenameValidator } from './filename.validator';
import { FileTypeValidator } from './file-type.validator';
import { FileSizeValidator } from './file-size.validator';

export interface FileValidationOptions {
  /**
   * Maximum file size in bytes
   */
  maxSize?: number;

  /**
   * Allowed MIME types
   */
  allowedTypes?: string[];

  /**
   * Whether to validate filename
   */
  validateFilename?: boolean;

  /**
   * Whether to validate file type
   */
  validateType?: boolean;

  /**
   * Whether to validate file size
   */
  validateSize?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;
}

/**
 * NestJS Pipe for comprehensive file validation
 * Validates filename, file type, and file size
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {
    // Set defaults
    this.options = {
      validateFilename: true,
      validateType: true,
      validateSize: true,
      ...options,
    };
  }

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException(
        this.options.errorMessage || 'File không được để trống',
      );
    }

    try {
      // Validate filename
      if (this.options.validateFilename) {
        const sanitizedFilename = FilenameValidator.validate(file.originalname);
        file.originalname = sanitizedFilename;
      }

      // Validate file type
      if (this.options.validateType) {
        FileTypeValidator.validate(file.mimetype, this.options.allowedTypes);
      }

      // Validate file size
      if (this.options.validateSize) {
        if (this.options.maxSize) {
          FileSizeValidator.validate(file.size, this.options.maxSize);
        } else {
          // Auto-detect max size based on MIME type
          FileSizeValidator.validateByType(file.size, file.mimetype);
        }
      }

      return file;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        this.options.errorMessage || 'File validation failed',
      );
    }
  }
}

/**
 * Pre-configured pipe for image uploads
 */
@Injectable()
export class ImageValidationPipe extends FileValidationPipe {
  constructor() {
    super({
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
      ],
      maxSize: 10 * 1024 * 1024, // 10MB
      errorMessage: 'File ảnh không hợp lệ',
    });
  }
}

/**
 * Pre-configured pipe for video uploads
 */
@Injectable()
export class VideoValidationPipe extends FileValidationPipe {
  constructor() {
    super({
      allowedTypes: [
        'video/mp4',
        'video/mpeg',
        'video/webm',
        'video/quicktime',
      ],
      maxSize: 100 * 1024 * 1024, // 100MB
      errorMessage: 'File video không hợp lệ',
    });
  }
}

/**
 * Pre-configured pipe for document uploads
 */
@Injectable()
export class DocumentValidationPipe extends FileValidationPipe {
  constructor() {
    super({
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
      ],
      maxSize: 20 * 1024 * 1024, // 20MB
      errorMessage: 'File tài liệu không hợp lệ',
    });
  }
}
