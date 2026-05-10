# Test Authentication

## 1. Register User Mới

### Endpoint
`POST /users/register`

### Request
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

### Expected Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Cases
- ✅ Register thành công với email mới
- ❌ Register với email đã tồn tại → Error "Email already in use"
- ❌ Register với password quá ngắn → Validation error
- ❌ Register với email không hợp lệ → Validation error

---

## 2. Login

### Endpoint
`POST /auth/login`

### Login với Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Login với User Thường
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

### Expected Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Lưu Token
```bash
# Lưu token vào biến để sử dụng cho các requests tiếp theo
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

echo $TOKEN
```

---

## 3. Test Login Thất Bại

### Sai Password
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'
```

**Expected:** Status 401, message "Invalid credentials"

### Email Không Tồn Tại
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "notexist@example.com",
    "password": "password123"
  }'
```

**Expected:** Status 401, message "Invalid credentials"

---

## 4. Decode JWT Token

### Sử dụng jwt.io
1. Copy token từ response
2. Vào https://jwt.io
3. Paste token vào phần "Encoded"
4. Xem payload ở phần "Decoded"

### JWT Payload Structure
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

---

## 5. Sử Dụng Token

### Test với Protected Endpoint
```bash
# Lấy danh sách roles (cần authentication)
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Status 200, trả về danh sách roles

### Test không có Token
```bash
curl -X GET http://localhost:3000/roles
```

**Expected:** Status 401 Unauthorized

### Test với Invalid Token
```bash
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected:** Status 403 Forbidden "Invalid token"

---

## 6. Test Token Expiration

Token có thời gian hết hạn (exp trong payload). Khi token hết hạn:

```bash
# Sử dụng token đã hết hạn
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $EXPIRED_TOKEN"
```

**Expected:** Status 403 Forbidden "Invalid token"

**Giải pháp:** Login lại để lấy token mới

---

## Script Test Tự Động

Tạo file `test-auth.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

echo "=== Test 1: Register User ==="
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser'$(date +%s)'@example.com",
    "password": "password123"
  }')
echo $REGISTER_RESPONSE | jq

echo -e "\n=== Test 2: Login Admin ==="
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')
echo "Token: $ADMIN_TOKEN"

echo -e "\n=== Test 3: Access Protected Endpoint ==="
curl -s -X GET $BASE_URL/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq

echo -e "\n=== Test 4: Login Failed (Wrong Password) ==="
curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"wrong"}' | jq

echo -e "\n=== Test 5: Access Without Token ==="
curl -s -X GET $BASE_URL/roles | jq
```

Chạy script:
```bash
chmod +x test-auth.sh
./test-auth.sh
```

---

## Tiếp Theo

- [Test Role Management](./03-test-role-management.md)
- [Test Permission Management](./04-test-permission-management.md)
- [Test Authorization](./05-test-authorization.md)
