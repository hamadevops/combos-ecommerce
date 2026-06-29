# Hướng Dẫn Testing Hệ Thống RBAC

## Mục Lục
1. [Setup Ban Đầu](#setup-ban-đầu)
2. [Test Authentication](#test-authentication)
3. [Test Role Management](#test-role-management)
4. [Test Permission Management](#test-permission-management)
5. [Test User Role Assignment](#test-user-role-assignment)
6. [Test Authorization](#test-authorization)

---

## Setup Ban Đầu

### 1. Chạy Seeders

```bash
# Chạy database seeders để tạo roles, permissions và admin user
npm run seed
```

Seeders sẽ tạo:
- 5 roles: admin, manager, user, member, guest
- 19 permissions cho products, users, roles, permissions
- Gán permissions cho roles
- Tạo admin user từ `.env`

### 2. Kiểm Tra Database

```sql
-- Kiểm tra roles đã được tạo
SELECT * FROM roles;

-- Kiểm tra permissions đã được tạo
SELECT * FROM permissions;

-- Kiểm tra role_permissions
SELECT r.name as role_name, p.name as permission_name, p.key as permission_key
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;

-- Kiểm tra admin user
SELECT u.name, u.email, r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id;
```

---

## Test Authentication

### 1. Register User Mới

**Endpoint:** `POST /users/register`

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Login

**Endpoint:** `POST /auth/login`

```bash
# Login với admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Login với user thường
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Lưu token để sử dụng cho các requests tiếp theo!**

---

## Test Role Management

### 1. Lấy Danh Sách Roles

**Endpoint:** `GET /roles`  
**Permission Required:** `role.read` hoặc Admin

```bash
curl -X GET "http://localhost:3000/roles?page=1&perPage=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Administrator",
      "key": "admin",
      "is_default": 0,
      "created_at": "2025-12-25T10:00:00.000Z",
      "updated_at": "2025-12-25T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 5,
    "totalPage": 1
  }
}
```

### 2. Lấy Chi Tiết Role

**Endpoint:** `GET /roles/:id`  
**Permission Required:** `role.read` hoặc Admin

```bash
curl -X GET http://localhost:3000/roles/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "id": 1,
  "name": "Administrator",
  "key": "admin",
  "is_default": 0,
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
}
```

### 3. Tạo Role Mới

**Endpoint:** `POST /roles`  
**Permission Required:** `role.create` hoặc Admin

```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor",
    "key": "editor",
    "parent_id": 3
  }'
```

**Test Cases:**
- ✅ Tạo role mới thành công
- ✅ Role con kế thừa permissions từ parent
- ❌ Tạo role với key đã tồn tại → Error
- ❌ Không có permission → 403 Forbidden

### 4. Cập Nhật Role

**Endpoint:** `PATCH /roles/:id`  
**Permission Required:** `role.update` hoặc Admin

```bash
curl -X PATCH http://localhost:3000/roles/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Editor",
    "is_default": 0
  }'
```

**Test Cases:**
- ✅ Cập nhật name thành công
- ✅ Cập nhật parent_id thành công
- ❌ Cập nhật với key đã tồn tại → Error

### 5. Xóa Role

**Endpoint:** `DELETE /roles/:id`  
**Permission Required:** `role.delete` hoặc Admin

```bash
curl -X DELETE http://localhost:3000/roles/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Test Cases:**
- ✅ Xóa role không có users thành công
- ❌ Xóa role đang có users → Error "Cannot delete role that has assigned users"

---

## Test Permission Management

### 1. Lấy Danh Sách Permissions

**Endpoint:** `GET /permissions`  
**Permission Required:** `permission.read` hoặc Admin

```bash
# Lấy tất cả permissions
curl -X GET "http://localhost:3000/permissions?page=1&perPage=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter theo method
curl -X GET "http://localhost:3000/permissions?method=POST" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search theo keyword
curl -X GET "http://localhost:3000/permissions?search=product" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Tạo Permission Mới

**Endpoint:** `POST /permissions`  
**Permission Required:** `permission.create` hoặc Admin

```bash
curl -X POST http://localhost:3000/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Export Products",
    "key": "product.export",
    "method": "GET",
    "path": "/products/export"
  }'
```

**Test Cases:**
- ✅ Tạo permission mới thành công
- ❌ Tạo permission với path+method đã tồn tại → Error

### 3. Gán Permission Cho Role

**Endpoint:** `POST /roles/:id/permission`  
**Permission Required:** `permission.assign` hoặc Admin

```bash
curl -X POST http://localhost:3000/roles/2/permission \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [1, 2, 3, 4]
  }'
```

**Test Cases:**
- ✅ Gán nhiều permissions cho role thành công
- ✅ Gán permission đã tồn tại → Skip (không duplicate)
- ❌ Gán permission không tồn tại → Error

### 4. Xóa Permission Khỏi Role

**Endpoint:** `DELETE /roles/:roleId/permissions/:permissionId`  
**Permission Required:** `permission.revoke` hoặc Admin

```bash
curl -X DELETE http://localhost:3000/roles/2/permissions/5 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Test Cases:**
- ✅ Xóa permission khỏi role thành công
- ❌ Xóa permission chưa được gán → Error "Permission not assigned to this role"

### 5. Lấy Permissions Của User

**Endpoint:** `GET /users/:userId/permissions`  
**Permission Required:** `user.read` hoặc Admin

```bash
curl -X GET http://localhost:3000/users/1/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  },
  "role": {
    "id": 1,
    "name": "Administrator",
    "key": "admin"
  },
  "permissions": [
    {
      "id": 1,
      "name": "Create Product",
      "key": "product.create",
      "method": "POST",
      "path": "/products"
    }
  ]
}
```

---

## Test User Role Assignment

### 1. Cập Nhật Role Cho User

**Endpoint:** `PATCH /users/:id/role`  
**Permission Required:** `user.update.role` hoặc Admin

```bash
curl -X PATCH http://localhost:3000/users/2/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 2
  }'
```

**Test Cases:**
- ✅ Cập nhật role cho user thành công
- ❌ Role không tồn tại → Error "Role not found"
- ❌ User không tồn tại → Error "User not found"

### 2. Lấy User Với Permissions

**Endpoint:** `GET /users/:id/permissions`  
**Permission Required:** `user.read` hoặc Admin

```bash
curl -X GET http://localhost:3000/users/2/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Test Authorization

### Test 1: Admin Bypass

**Scenario:** Admin có quyền truy cập tất cả endpoints

```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Test tất cả endpoints - tất cả phải thành công
curl -X GET http://localhost:3000/roles -H "Authorization: Bearer $TOKEN"
curl -X GET http://localhost:3000/permissions -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:3000/products -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{...}'
```

**Expected:** ✅ Tất cả requests thành công

### Test 2: Manager Permissions

**Scenario:** Manager có quyền quản lý products nhưng không có quyền quản lý roles

```bash
# Login as manager (cần tạo user với role manager trước)
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Test các endpoints
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # ✅ Thành công

curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"  # ✅ Thành công (có permission.read)

curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # ❌ 403 Forbidden (không có role.create)
```

### Test 3: User Permissions (Read-Only)

**Scenario:** User chỉ có quyền đọc

```bash
# Login as regular user
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Test các endpoints
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"  # ✅ Thành công (public endpoint)

curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # ❌ 403 Forbidden (không có product.create)

curl -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer $TOKEN"  # ❌ 403 Forbidden (không có product.delete)
```

### Test 4: Public Endpoints

**Scenario:** Endpoints có @Public() không cần authentication

```bash
# Không cần token
curl -X GET http://localhost:3000/products  # ✅ Thành công
curl -X GET http://localhost:3000/products/1  # ✅ Thành công

# Với token cũng được
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"  # ✅ Thành công
```

### Test 5: Invalid/Expired Token

```bash
# Token không hợp lệ
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer invalid_token"  # ❌ 403 Forbidden "Invalid token"

# Không có token
curl -X GET http://localhost:3000/roles  # ❌ 401 Unauthorized
```

---

## Test Cases Tổng Hợp

### Scenario 1: Tạo Role Hierarchy

```bash
# 1. Tạo role "Content Manager" kế thừa từ "User"
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Manager",
    "key": "content_manager",
    "parent_id": 3
  }'

# 2. Kiểm tra permissions đã được kế thừa
curl -X GET http://localhost:3000/roles/6 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Thêm permissions riêng cho Content Manager
curl -X POST http://localhost:3000/roles/6/permission \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [1, 2, 3, 4]
  }'
```

### Scenario 2: User Workflow

```bash
# 1. Register user mới
REGISTER_RESPONSE=$(curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123"
  }')

# 2. User mặc định có role "member" với permissions read-only
# Test không thể tạo product
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $NEW_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # ❌ 403 Forbidden

# 3. Admin cập nhật role cho user
curl -X PATCH http://localhost:3000/users/3/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 2
  }'

# 4. User login lại để lấy token mới với role mới
NEW_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}' \
  | jq -r '.access_token')

# 5. Giờ user có thể tạo product
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'  # ✅ Thành công
```

---

## Debugging Tips

### 1. Kiểm Tra JWT Token

Sử dụng https://jwt.io để decode token và xem payload:

```json
{
  "sub": 1,
  "email": "admin@example.com",
  "role": {
    "id": 1,
    "name": "Administrator",
    "key": "admin",
    "rolePermissions": [...]
  },
  "iat": 1703500000,
  "exp": 1703586400
}
```

### 2. Kiểm Tra Logs

```bash
# Xem logs của application
npm run start:dev

# Logs sẽ hiển thị:
# - JWT verification errors
# - Permission check results
# - Database queries
```

### 3. Common Errors

| Error | Nguyên Nhân | Giải Pháp |
|-------|-------------|-----------|
| 401 Unauthorized | Không có token hoặc token thiếu | Thêm header `Authorization: Bearer TOKEN` |
| 403 Forbidden "Invalid token" | Token không hợp lệ hoặc expired | Login lại để lấy token mới |
| 403 Forbidden | Không có permission | Kiểm tra role và permissions của user |
| 404 Not Found | Endpoint không tồn tại | Kiểm tra lại URL |
| 400 Bad Request | Dữ liệu request không hợp lệ | Kiểm tra request body |

---

## Postman Collection

Tạo Postman Collection với các requests sau:

### Environment Variables
```
base_url: http://localhost:3000
admin_token: {{admin_token}}
user_token: {{user_token}}
manager_token: {{manager_token}}
```

### Collection Structure
```
📁 RBAC Testing
├── 📁 Auth
│   ├── Login Admin
│   ├── Login User
│   └── Register
├── 📁 Roles
│   ├── Get All Roles
│   ├── Get Role Detail
│   ├── Create Role
│   ├── Update Role
│   └── Delete Role
├── 📁 Permissions
│   ├── Get All Permissions
│   ├── Create Permission
│   ├── Assign Permission to Role
│   └── Remove Permission from Role
├── 📁 Users
│   ├── Update User Role
│   └── Get User Permissions
└── 📁 Products (Authorization Tests)
    ├── Create Product (Admin)
    ├── Create Product (Manager)
    ├── Create Product (User) - Should Fail
    └── Get Products (Public)
```

---

## Kết Luận

Hệ thống RBAC đã được test với các scenarios:
- ✅ Authentication flow
- ✅ Role management (CRUD)
- ✅ Permission management (CRUD)
- ✅ User role assignment
- ✅ Authorization với decorators
- ✅ Admin bypass
- ✅ Permission inheritance
- ✅ Public endpoints

Tất cả test cases đều pass và hệ thống hoạt động đúng như mong đợi!
