import slugify from 'slugify';
import { randomBytes } from 'node:crypto';

export function generateProductSku(name: string): string {
  const prefix = slugify(name, {
    strict: true,
    locale: 'vi',
    lower: false,
  })
    .toUpperCase()
    .split('-')
    .slice(0, 3)
    .join('-');

  // 3 bytes = 6 hex chars = 16.7 million combinations
  const random = randomBytes(3).toString('hex').toUpperCase();

  return `${prefix}-${random}`;
}
