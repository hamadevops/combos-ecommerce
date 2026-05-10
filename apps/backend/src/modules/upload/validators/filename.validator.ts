import { BadRequestException } from '@nestjs/common';

/**
 * Validates filename to prevent security issues
 * - Prevents path traversal attacks (../, ..\)
 * - Prevents null byte injection
 * - Prevents dangerous characters
 * - Ensures reasonable filename length
 */
export class FilenameValidator {
  private static readonly MAX_FILENAME_LENGTH = 255;
  private static readonly DANGEROUS_PATTERNS = [
    /\.\./g, // Path traversal
    /\0/g, // Null bytes
    /[<>:"|?*]/g, // Windows reserved characters
    /^\./, // Hidden files starting with dot
    /\s{2,}/g, // Multiple consecutive spaces
  ];

  private static readonly DANGEROUS_EXTENSIONS = [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.pif',
    '.scr',
    '.vbs',
    '.js',
    '.jar',
    '.msi',
    '.app',
    '.deb',
    '.rpm',
    '.dmg',
    '.pkg',
    '.sh',
    '.bash',
    '.zsh',
    '.fish',
    '.ps1',
    '.psm1',
  ];

  /**
   * Validates a filename
   * @param filename - The filename to validate
   * @returns The sanitized filename
   * @throws BadRequestException if filename is invalid
   */
  static validate(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      throw new BadRequestException('Tên file không hợp lệ');
    }

    // Trim whitespace
    filename = filename.trim();

    // Check length
    if (filename.length === 0) {
      throw new BadRequestException('Tên file không được để trống');
    }

    if (filename.length > this.MAX_FILENAME_LENGTH) {
      throw new BadRequestException(
        `Tên file quá dài (tối đa ${this.MAX_FILENAME_LENGTH} ký tự)`,
      );
    }

    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(filename)) {
        throw new BadRequestException(
          'Tên file chứa ký tự hoặc mẫu không được phép',
        );
      }
    }

    // Check for dangerous extensions
    const lowerFilename = filename.toLowerCase();
    for (const ext of this.DANGEROUS_EXTENSIONS) {
      if (lowerFilename.endsWith(ext)) {
        throw new BadRequestException(
          `Định dạng file ${ext} không được phép tải lên`,
        );
      }
    }

    // Sanitize filename: replace dangerous characters with underscore
    const sanitized = filename
      .replace(/[^\w\s.-]/g, '_') // Replace non-word chars except spaces, dots, hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_'); // Replace multiple underscores with single

    return sanitized;
  }

  /**
   * Extracts and validates file extension
   * @param filename - The filename
   * @returns The file extension (lowercase, with dot)
   */
  static getExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) {
      return '';
    }
    return '.' + parts[parts.length - 1].toLowerCase();
  }
}
