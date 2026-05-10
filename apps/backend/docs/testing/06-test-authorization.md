# Test Authorization

Test các scenarios phân quyền với decorators @Permissions và @Roles.

## Setup
```bash
# Login với các roles khác nhau
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Tạo manager user nếu chưa có
# Sau đó login
MANAGER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Tạo regular user
USER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.access_token')
```

---

## Test 1: Admin Bypass

**Scenario:** Admin có quyền truy cập tất cả endpoints

```bash
echo "=== Admin Testing All Endpoints ==="

# Test GET /roles
curl -s -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '{success: true, count: .items | length}'

# Test POST /roles
curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","key":"test"}' \
  | jq '{success: true, id}'

# Test GET /permissions
curl -s -X GET http://localhost:3000/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '{success: true, count: .items | length}'

# Test POST /products
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Test Product' \
  | jq '{success: true}'
```

**Expected:** ✅ Tất cả requests thành công

---

## Test 2: Manager Permissions

**Scenario:** Manager có quyền quản lý products nhưng không có quyền quản lý roles

### Test Product Management (Should Success)
```bash
echo "=== Manager: Product Management ==="

# Create product - Manager có permission product.create
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Manager Product' \
  | jq '{success: true, id}'

# Update product - Manager có permission product.update
curl -s -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Updated Product' \
  | jq '{success: true}'

# Delete product - Manager có permission product.delete
curl -s -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  | jq '{success: true}'
```

**Expected:** ✅ Tất cả thành công

### Test Role Management (Should Fail)
```bash
echo "=== Manager: Role Management (Should Fail) ==="

# Read roles - Manager có permission role.read
curl -s -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  | jq '{success: true}'

# Create role - Manager KHÔNG có permission role.create
curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","key":"test"}' \
  | jq

# Update role - Manager KHÔNG có permission role.update
curl -s -X PATCH http://localhost:3000/roles/2 \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated"}' \
  | jq

# Delete role - Manager KHÔNG có permission role.delete
curl -s -X DELETE http://localhost:3000/roles/2 \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  | jq
```

**Expected:**
- ✅ GET /roles thành công
- ❌ POST /roles → 403 Forbidden
- ❌ PATCH /roles/:id → 403 Forbidden
- ❌ DELETE /roles/:id → 403 Forbidden

---

## Test 3: User Permissions (Read-Only)

**Scenario:** User chỉ có quyền đọc

```bash
echo "=== User: Read Operations ==="

# Read products - Public endpoint
curl -s -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '{success: true, count: .items | length}'

# Read users - User có permission user.read
curl -s -X GET http://localhost:3000/users/1/permissions \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq '{success: true}'

echo -e "\n=== User: Write Operations (Should Fail) ==="

# Create product - User KHÔNG có permission product.create
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=User Product' \
  | jq

# Update product - User KHÔNG có permission product.update
curl -s -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Updated' \
  | jq

# Delete product - User KHÔNG có permission product.delete
curl -s -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  | jq

# Create role - User KHÔNG có permission role.create
curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","key":"test"}' \
  | jq
```

**Expected:**
- ✅ Read operations thành công
- ❌ Tất cả write operations → 403 Forbidden

---

## Test 4: Public Endpoints

**Scenario:** Endpoints có @Public() không cần authentication

```bash
echo "=== Public Endpoints (No Token) ==="

# Get products - Public
curl -s -X GET http://localhost:3000/products | jq '{success: true}'

# Get product detail - Public
curl -s -X GET http://localhost:3000/products/1 | jq '{success: true}'

# Register - Public
curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Public User",
    "email": "public'$(date +%s)'@example.com",
    "password": "password123"
  }' | jq '{success: true}'

echo -e "\n=== Public Endpoints (With Token) ==="

# Public endpoints vẫn hoạt động với token
curl -s -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $USER_TOKEN" | jq '{success: true}'
```

**Expected:** ✅ Tất cả thành công (cả có và không có token)

---

## Test 5: Invalid/Expired Token

```bash
echo "=== Invalid Token ==="

# Token không hợp lệ
curl -s -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer invalid_token_here" \
  | jq

# Không có token
curl -s -X GET http://localhost:3000/roles | jq

# Token format sai
curl -s -X GET http://localhost:3000/roles \
  -H "Authorization: invalid_token_here" \
  | jq
```

**Expected:**
- ❌ Invalid token → 403 Forbidden "Invalid token"
- ❌ No token → 401 Unauthorized
- ❌ Wrong format → 401 Unauthorized

---

## Test 6: Permission Change Workflow

**Scenario:** User role thay đổi, permissions cũng thay đổi

```bash
# 1. Register user mới
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser'$(date +%s)'@example.com",
    "password": "password123"
  }')
NEW_USER_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')

# 2. User mặc định có role "member" - chỉ read
echo "=== Step 1: User with Member Role ==="
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $NEW_USER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Test' \
  | jq '{expected: "403 Forbidden"}'

# 3. Admin cập nhật role cho user thành Manager
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')
curl -s -X PATCH http://localhost:3000/users/$USER_ID/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roleId":2}' | jq

# 4. User login lại để lấy token mới
echo -e "\n=== Step 2: User Login Again ==="
NEW_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$(echo $REGISTER_RESPONSE | jq -r '.user.email')\",
    \"password\":\"password123\"
  }" | jq -r '.access_token')

# 5. Giờ user có thể tạo product
echo -e "\n=== Step 3: User with Manager Role ==="
curl -s -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Manager Product' \
  | jq '{expected: "Success"}'
```

**Expected:**
- Step 1: ❌ 403 Forbidden
- Step 3: ✅ Success

---

## Test 7: Multiple Permissions (OR Logic)

**Scenario:** Endpoint yêu cầu ít nhất 1 trong nhiều permissions

```bash
# Giả sử endpoint có: @Permissions(PermissionEnum.PRODUCT_UPDATE, PermissionEnum.PRODUCT_DELETE)
# User chỉ cần có 1 trong 2 permissions

# Manager có cả 2 permissions
curl -s -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Updated' \
  | jq '{success: true}'

# User không có permission nào
curl -s -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F 'name=Updated' \
  | jq '{expected: "403 Forbidden"}'
```

---

## Script Test Tự Động

Tạo file `test-authorization.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Get tokens
ADMIN_TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

echo "=== Test 1: Admin Bypass ==="
curl -s -X GET $BASE_URL/roles -H "Authorization: Bearer $ADMIN_TOKEN" | jq '{test: "admin_bypass", success: true}'

echo -e "\n=== Test 2: Public Endpoints ==="
curl -s -X GET $BASE_URL/products | jq '{test: "public_no_token", success: true}'

echo -e "\n=== Test 3: Invalid Token ==="
curl -s -X GET $BASE_URL/roles -H "Authorization: Bearer invalid" | jq '{test: "invalid_token", expected: "403"}'

echo -e "\n=== Test 4: No Token ==="
curl -s -X GET $BASE_URL/roles | jq '{test: "no_token", expected: "401"}'

echo -e "\n=== Test 5: Permission Check ==="
# Create user without permission
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "password123"
  }')
USER_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')

curl -s -X POST $BASE_URL/roles \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","key":"test"}' \
  | jq '{test: "user_create_role", expected: "403"}'
```

Chạy script:
```bash
chmod +x test-authorization.sh
./test-authorization.sh
```

---

## Summary Table

| User Role | product.create | product.read | role.create | role.read |
|-----------|---------------|--------------|-------------|-----------|
| Admin     | ✅            | ✅           | ✅          | ✅        |
| Manager   | ✅            | ✅           | ❌          | ✅        |
| User      | ❌            | ✅           | ❌          | ❌        |
| Guest     | ❌            | ✅           | ❌          | ❌        |

---

## Tiếp Theo

- [Common Issues & Debugging](./07-debugging.md)
- [Postman Collection](./08-postman-collection.md)
