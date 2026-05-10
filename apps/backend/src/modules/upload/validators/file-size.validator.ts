import { BadRequestException } from '@nestjs/common';

/**
 * Validates file sizes to prevent DoS attacks and storage issues
 */
export class FileSizeValidator {
  // Size limits in bytes
  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private static readonly MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB
  private static readonly MAX_ARCHIVE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly MAX_DEFAULT_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Formats bytes to human-readable format
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "10 MB")
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Validates file size against a maximum limit
   * @param size - File size in bytes
   * @param maxSize - Maximum allowed size in bytes
   * @throws BadRequestException if file is too large
   */
  static validate(size: number, maxSize: number = this.MAX_DEFAULT_SIZE): void {
    if (typeof size !== 'number' || size < 0) {
      throw new BadRequestException('Kích thước file không hợp lệ');
    }

    if (size === 0) {
      throw new BadRequestException('File không được để trống');
    }

    if (size > maxSize) {
      throw new BadRequestException(
        `File quá lớn. Kích thước tối đa: ${this.formatBytes(maxSize)}, kích thước file: ${this.formatBytes(size)}`,
      );
    }
  }

  /**
   * Validates image file size
   * @param size - File size in bytes
   * @throws BadRequestException if image is too large
   */
  static validateImage(size: number): void {
    this.validate(size, this.MAX_IMAGE_SIZE);
  }

  /**
   * Validates video file size
   * @param size - File size in bytes
   * @throws BadRequestException if video is too large
   */
  static validateVideo(size: number): void {
    this.validate(size, this.MAX_VIDEO_SIZE);
  }

  /**
   * Validates document file size
   * @param size - File size in bytes
   * @throws BadRequestException if document is too large
   */
  static validateDocument(size: number): void {
    this.validate(size, this.MAX_DOCUMENT_SIZE);
  }

  /**
   * Validates archive file size
   * @param size - File size in bytes
   * @throws BadRequestException if archive is too large
   */
  static validateArchive(size: number): void {
    this.validate(size, this.MAX_ARCHIVE_SIZE);
  }

  /**
   * Gets the maximum size for a given MIME type
   * @param mimetype - The MIME type
   * @returns Maximum size in bytes
   */
  static getMaxSizeForType(mimetype: string): number {
    if (mimetype.startsWith('image/')) {
      return this.MAX_IMAGE_SIZE;
    } else if (mimetype.startsWith('video/')) {
      return this.MAX_VIDEO_SIZE;
    } else if (
      mimetype.includes('pdf') ||
      mimetype.includes('document') ||
      mimetype.includes('sheet') ||
      mimetype.includes('text')
    ) {
      return this.MAX_DOCUMENT_SIZE;
    } else if (
      mimetype.includes('zip') ||
      mimetype.includes('rar') ||
      mimetype.includes('tar') ||
      mimetype.includes('gzip')
    ) {
      return this.MAX_ARCHIVE_SIZE;
    }
    return this.MAX_DEFAULT_SIZE;
  }

  /**
   * Validates file size based on MIME type
   * @param size - File size in bytes
   * @param mimetype - The MIME type
   * @throws BadRequestException if file is too large
   */
  static validateByType(size: number, mimetype: string): void {
    const maxSize = this.getMaxSizeForType(mimetype);
    this.validate(size, maxSize);
  }
}
