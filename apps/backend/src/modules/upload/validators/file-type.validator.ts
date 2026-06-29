import { BadRequestException } from '@nestjs/common';

/**
 * Validates file MIME types to prevent malicious uploads
 */
export class FileTypeValidator {
  // Allowed MIME types for different categories
  private static readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];

  private static readonly ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
  ];

  private static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ];

  private static readonly ALLOWED_ARCHIVE_TYPES = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
  ];

  /**
   * Get all allowed MIME types
   */
  static getAllowedTypes(): string[] {
    return [
      ...this.ALLOWED_IMAGE_TYPES,
      ...this.ALLOWED_VIDEO_TYPES,
      ...this.ALLOWED_DOCUMENT_TYPES,
      ...this.ALLOWED_ARCHIVE_TYPES,
    ];
  }

  /**
   * Validates if file MIME type is allowed
   * @param mimetype - The MIME type to validate
   * @param allowedTypes - Optional custom allowed types
   * @throws BadRequestException if MIME type is not allowed
   */
  static validate(mimetype: string, allowedTypes?: string[]): void {
    if (!mimetype || typeof mimetype !== 'string') {
      throw new BadRequestException('Loại file không hợp lệ');
    }

    const allowed = allowedTypes || this.getAllowedTypes();

    if (!allowed.includes(mimetype.toLowerCase())) {
      throw new BadRequestException(
        `Loại file "${mimetype}" không được phép. Chỉ chấp nhận: ${allowed.join(', ')}`,
      );
    }
  }

  /**
   * Validates if file is an image
   * @param mimetype - The MIME type to check
   * @returns true if file is an allowed image type
   */
  static isImage(mimetype: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(mimetype.toLowerCase());
  }

  /**
   * Validates if file is a video
   * @param mimetype - The MIME type to check
   * @returns true if file is an allowed video type
   */
  static isVideo(mimetype: string): boolean {
    return this.ALLOWED_VIDEO_TYPES.includes(mimetype.toLowerCase());
  }

  /**
   * Validates if file is a document
   * @param mimetype - The MIME type to check
   * @returns true if file is an allowed document type
   */
  static isDocument(mimetype: string): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(mimetype.toLowerCase());
  }

  /**
   * Validates if file is an archive
   * @param mimetype - The MIME type to check
   * @returns true if file is an allowed archive type
   */
  static isArchive(mimetype: string): boolean {
    return this.ALLOWED_ARCHIVE_TYPES.includes(mimetype.toLowerCase());
  }

  /**
   * Validates file type for images only
   * @param mimetype - The MIME type to validate
   * @throws BadRequestException if not an allowed image type
   */
  static validateImage(mimetype: string): void {
    this.validate(mimetype, this.ALLOWED_IMAGE_TYPES);
  }

  /**
   * Validates file type for videos only
   * @param mimetype - The MIME type to validate
   * @throws BadRequestException if not an allowed video type
   */
  static validateVideo(mimetype: string): void {
    this.validate(mimetype, this.ALLOWED_VIDEO_TYPES);
  }

  /**
   * Validates file type for documents only
   * @param mimetype - The MIME type to validate
   * @throws BadRequestException if not an allowed document type
   */
  static validateDocument(mimetype: string): void {
    this.validate(mimetype, this.ALLOWED_DOCUMENT_TYPES);
  }
}
