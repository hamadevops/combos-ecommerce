import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Sử dụng EMAIL_ENCRYPTION_KEY nếu có, nếu không thì fallback về JWT_SECRET
const SECRET_KEY =
  process.env.EMAIL_ENCRYPTION_KEY ||
  process.env.JWT_SECRET ||
  'default_fallback_secret_key_32b';

// Hàm tạo khóa 32 bytes (256 bits) cố định từ secret string
function getKey(): Buffer {
  return crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
}

/**
 * Mã hóa chuỗi văn bản
 * @param text Chuỗi cần mã hóa
 * @returns Chuỗi định dạng `iv:encryptedText` (hex data)
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Giải mã chuỗi văn bản đã bị mã hóa
 * @param encryptedText Chuỗi định dạng `iv:encryptedText`
 * @returns Chuỗi văn bản gốc
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  // Kiểm tra định dạng iv:encryptedText (tương thích ngược cho plain text cũ)
  if (!encryptedText.includes(':')) {
    return encryptedText;
  }

  try {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedData = Buffer.from(textParts.join(':'), 'hex');

    // Đảm bảo IV có độ dài 16 bytes. Nếu không phải (do plain text xui xẻo có dấu :), trả về nguyên gốc.
    if (iv.length !== 16) {
      return encryptedText;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Nếu giải mã lỗi (do sai key hoặc chuỗi ko phải do mình mã hóa), fallback về giá trị gốc của chuỗi
    return encryptedText;
  }
}
