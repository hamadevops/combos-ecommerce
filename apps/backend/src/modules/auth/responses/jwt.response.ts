/**
 * Simplified JWT Payload - không chứa permissions trong token
 * Permissions sẽ được lookup từ database khi cần
 */
export interface JwtPayload {
  sub: number;
  email: string;
  role: string; // Role key (e.g., 'admin', 'user')
  iat?: number;
  exp?: number;
}

/**
 * User object được attach vào request sau khi verify JWT
 * Có thêm permissions được fetch từ database
 */
export interface RequestUser extends JwtPayload {
  id: number;
  userId: number;
  permissions?: string[]; // Permission keys
}
