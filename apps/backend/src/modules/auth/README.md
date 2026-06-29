# Auth Module

Module xử lý authentication (đăng nhập) cho hệ thống.

## Chức Năng

- Login với email và password
- Validate user credentials
- Generate JWT access token
- Token chứa thông tin user, role và permissions

## API Endpoints

### POST /auth/login

Đăng nhập và nhận JWT token

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**JWT Token Payload:**
```json
{
  "sub": 1,
  "email": "admin@example.com",
  "role": {
    "id": 1,
    "name": "Administrator",
    "key": "admin",
    "rolePermissions": [
      {
        "permission": {
          "id": 1,
          "name": "Create Product",
          "key": "product.create",
          "method": "POST",
          "path": "/products"
        }
      }
    ]
  },
  "iat": 1703500000,
  "exp": 1703586400
}
```

## Testing

### Test Login Thành Công

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Expected:** Status 200, trả về access_token

### Test Login Thất Bại

```bash
# Sai password
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'
```

**Expected:** Status 401, message "Invalid credentials"

```bash
# Email không tồn tại
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notexist@example.com",
    "password": "password123"
  }'
```

**Expected:** Status 401, message "Invalid credentials"

## Sử Dụng Token

Sau khi login, sử dụng token cho các requests khác:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"
```

## Decode Token

Sử dụng https://jwt.io để decode và xem nội dung token.

## Sử Dụng Trong Code

```typescript
import { AuthService } from './auth.service';

constructor(private authService: AuthService) {}

// Login
const result = await this.authService.login({
  email: 'user@example.com',
  password: 'password123'
});
// Returns: { access_token: '...' }

// Validate user
const user = await this.authService.validateUser(
  'user@example.com',
  'password123'
);
// Returns: User object without password
```

## Lưu Ý

- Token có thời gian hết hạn (exp), cần login lại khi hết hạn
- Password được hash bằng bcrypt trước khi so sánh
- Token chứa đầy đủ thông tin role và permissions để AuthGuard kiểm tra
- Không bao giờ trả về password trong response
