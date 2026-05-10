# Test Permission Management

**Permission Required:** Admin hoặc có permissions tương ứng

## Setup
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')
```

---

## 1. Lấy Danh Sách Permissions

### Endpoint
`GET /permissions`

### Request - Lấy Tất Cả
```bash
curl -X GET "http://localhost:3000/permissions?page=1&perPage=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Request - Filter Theo Method
```bash
curl -X GET "http://localhost:3000/permissions?method=POST" \
  -H "Authorization: Bearer $TOKEN"
```

### Request - Search Theo Keyword
```bash
curl -X GET "http://localhost:3000/permissions?search=product" \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
```json
{
  "items": [
    {
      "id": 1,
      "name": "Create Product",
      "key": "product.create",
      "method": "POST",
      "path": "/products",
      "created_at": "2025-12-25T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 19,
    "totalPage": 1
  }
}
```

---

## 2. Tạo Permission Mới

### Endpoint
`POST /permissions`

### Request
```bash
curl -X POST http://localhost:3000/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Export Products",
    "key": "product.export",
    "method": "GET",
    "path": "/products/export"
  }'
```

### Expected Response
```json
{
  "id": 20,
  "name": "Export Products",
  "key": "product.export",
  "method": "GET",
  "path": "/products/export",
  "created_at": "2025-12-25T11:00:00.000Z",
  "updated_at": "2025-12-25T11:00:00.000Z"
}
```

### Test Cases
- ✅ Tạo permission mới thành công
- ❌ Tạo permission với path+method đã tồn tại → Error "Permission already exists"
- ❌ Không có permission `permission.create` → 403 Forbidden

---

## 3. Gán Permission Cho Role

### Endpoint
`POST /roles/:id/permission`

### Request - Gán Một Permission
```bash
curl -X POST http://localhost:3000/roles/2/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [1]
  }'
```

### Request - Gán Nhiều Permissions
```bash
curl -X POST http://localhost:3000/roles/2/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [1, 2, 3, 4, 5]
  }'
```

### Expected Response
```json
{
  "id": 2,
  "name": "Manager",
  "key": "manager",
  "is_default": 0
}
```

### Test Cases
- ✅ Gán nhiều permissions cho role thành công
- ✅ Gán permission đã tồn tại → Skip (không duplicate)
- ❌ Gán permission không tồn tại → Error "Permission with id X not found"
- ❌ Role không tồn tại → Error "Role not found"

---

## 4. Xóa Permission Khỏi Role

### Endpoint
`DELETE /roles/:roleId/permissions/:permissionId`

### Request
```bash
curl -X DELETE http://localhost:3000/roles/2/permissions/5 \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
```json
{
  "message": "Permission removed from role successfully"
}
```

### Test Cases
- ✅ Xóa permission khỏi role thành công
- ❌ Xóa permission chưa được gán → Error "Permission not assigned to this role"
- ❌ Role không tồn tại → Error "Role not found"
- ❌ Permission không tồn tại → Error "Permission not found"

---

## 5. Lấy Permissions Của User

### Endpoint
`GET /users/:userId/permissions`

### Request
```bash
curl -X GET http://localhost:3000/users/1/permissions \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
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

## 6. Test Workflow: Gán Permissions Cho Role Mới

```bash
# 1. Tạo role mới
ROLE_RESPONSE=$(curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Manager",
    "key": "product_manager"
  }')
ROLE_ID=$(echo $ROLE_RESPONSE | jq -r '.id')
echo "Created role ID: $ROLE_ID"

# 2. Lấy danh sách permissions liên quan đến products
PRODUCT_PERMS=$(curl -s -X GET "http://localhost:3000/permissions?search=product" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.items[].id' | tr '\n' ',' | sed 's/,$//')
echo "Product permission IDs: $PRODUCT_PERMS"

# 3. Gán tất cả product permissions cho role
curl -X POST http://localhost:3000/roles/$ROLE_ID/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"permissionIds\":[$PRODUCT_PERMS]}"

# 4. Kiểm tra permissions đã được gán
curl -s -X GET http://localhost:3000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.rolePermissions[] | .permission | {id, name, key}'

# 5. Tạo user mới với role này
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Manager User",
    "email": "pm'$(date +%s)'@example.com",
    "password": "password123"
  }')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')

# 6. Cập nhật role cho user
curl -X PATCH http://localhost:3000/users/$USER_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"roleId\":$ROLE_ID}"

# 7. Kiểm tra permissions của user
curl -s -X GET http://localhost:3000/users/$USER_ID/permissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.permissions[] | {name, key}'
```

---

## 7. Test Xóa và Thêm Lại Permissions

```bash
ROLE_ID=2  # Manager role

# 1. Lấy danh sách permissions hiện tại
echo "=== Current Permissions ==="
curl -s -X GET http://localhost:3000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.rolePermissions[] | .permission | {id, name}'

# 2. Xóa một permission
PERM_ID=1
echo -e "\n=== Removing Permission $PERM_ID ==="
curl -s -X DELETE http://localhost:3000/roles/$ROLE_ID/permissions/$PERM_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Kiểm tra lại
echo -e "\n=== After Removal ==="
curl -s -X GET http://localhost:3000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.rolePermissions[] | .permission | {id, name}'

# 4. Thêm lại permission
echo -e "\n=== Adding Permission Back ==="
curl -s -X POST http://localhost:3000/roles/$ROLE_ID/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"permissionIds\":[$PERM_ID]}" | jq

# 5. Kiểm tra lại lần nữa
echo -e "\n=== After Adding Back ==="
curl -s -X GET http://localhost:3000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.rolePermissions[] | .permission | {id, name}'
```

---

## Script Test Tự Động

Tạo file `test-permissions.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Login admin
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

echo "=== Test 1: Get All Permissions ==="
curl -s -X GET "$BASE_URL/permissions" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.items[] | {id, name, key, method}'

echo -e "\n=== Test 2: Filter by Method ==="
curl -s -X GET "$BASE_URL/permissions?method=POST" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.items[] | {name, method}'

echo -e "\n=== Test 3: Search Product Permissions ==="
curl -s -X GET "$BASE_URL/permissions?search=product" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.items[] | {name, key}'

echo -e "\n=== Test 4: Create Permission ==="
curl -s -X POST $BASE_URL/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Permission '$(date +%s)'",
    "key": "test.permission.'$(date +%s)'",
    "method": "GET",
    "path": "/test"
  }' | jq

echo -e "\n=== Test 5: Assign Permissions to Role ==="
curl -s -X POST $BASE_URL/roles/2/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds":[1,2,3]}' | jq

echo -e "\n=== Test 6: Get User Permissions ==="
curl -s -X GET $BASE_URL/users/1/permissions \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{user: .user.name, role: .role.name, permission_count: .permissions | length}'
```

Chạy script:
```bash
chmod +x test-permissions.sh
./test-permissions.sh
```

---

## Tiếp Theo

- [Test User Role Assignment](./05-test-user-role-assignment.md)
- [Test Authorization](./06-test-authorization.md)
