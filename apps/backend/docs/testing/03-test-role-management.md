# Test Role Management

**Permission Required:** Admin hoặc có permissions tương ứng

## Setup
```bash
# Lấy admin token trước
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')
```

---

## 1. Lấy Danh Sách Roles

### Endpoint
`GET /roles`

### Request
```bash
curl -X GET "http://localhost:3000/roles?page=1&perPage=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Query Parameters
- `page` (number, optional): Trang hiện tại (default: 1)
- `perPage` (number, optional): Số items mỗi trang (default: 20)
- `search` (string, optional): Tìm kiếm theo name hoặc key

### Expected Response
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

### Test với Search
```bash
curl -X GET "http://localhost:3000/roles?search=admin" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. Lấy Chi Tiết Role

### Endpoint
`GET /roles/:id`

### Request
```bash
curl -X GET http://localhost:3000/roles/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
```json
{
  "id": 1,
  "name": "Administrator",
  "key": "admin",
  "is_default": 0,
  "parent": null,
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

---

## 3. Tạo Role Mới

### Endpoint
`POST /roles`

### Request - Role Đơn Giản
```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor",
    "key": "editor"
  }'
```

### Request - Role với Parent (Kế Thừa Permissions)
```bash
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Manager",
    "key": "content_manager",
    "parent_id": 3
  }'
```

### Expected Response
```json
{
  "id": 6,
  "name": "Editor",
  "key": "editor",
  "is_default": 1,
  "created_at": "2025-12-25T11:00:00.000Z",
  "updated_at": "2025-12-25T11:00:00.000Z"
}
```

### Test Cases
- ✅ Tạo role mới thành công
- ✅ Role con kế thừa permissions từ parent
- ❌ Tạo role với key đã tồn tại → Error "Role already exists"
- ❌ Không có permission `role.create` → 403 Forbidden

---

## 4. Cập Nhật Role

### Endpoint
`PATCH /roles/:id`

### Request - Cập Nhật Name
```bash
curl -X PATCH http://localhost:3000/roles/6 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Editor"
  }'
```

### Request - Cập Nhật Parent
```bash
curl -X PATCH http://localhost:3000/roles/6 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parent_id": 2
  }'
```

### Request - Cập Nhật Nhiều Fields
```bash
curl -X PATCH http://localhost:3000/roles/6 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Editor",
    "key": "senior_editor",
    "is_default": 0
  }'
```

### Test Cases
- ✅ Cập nhật name thành công
- ✅ Cập nhật parent_id thành công
- ✅ Cập nhật is_default thành công
- ❌ Cập nhật với key đã tồn tại → Error "Role with this key or name already exists"
- ❌ Parent role không tồn tại → Error "Parent role not found"

---

## 5. Xóa Role

### Endpoint
`DELETE /roles/:id`

### Request
```bash
curl -X DELETE http://localhost:3000/roles/6 \
  -H "Authorization: Bearer $TOKEN"
```

### Expected Response
```json
{
  "message": "Role deleted successfully"
}
```

### Test Cases
- ✅ Xóa role không có users thành công
- ❌ Xóa role đang có users → Error "Cannot delete role that has assigned users"
- ❌ Role không tồn tại → Error "Role not found"

### Test Xóa Role Có Users
```bash
# 1. Tạo role mới
ROLE_RESPONSE=$(curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Role","key":"test_role"}')
ROLE_ID=$(echo $ROLE_RESPONSE | jq -r '.id')

# 2. Gán role cho user
curl -X PATCH http://localhost:3000/users/2/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"roleId\":$ROLE_ID}"

# 3. Thử xóa role → Sẽ fail
curl -X DELETE http://localhost:3000/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Test Role Hierarchy

### Scenario: Tạo Role Hierarchy
```bash
# 1. Tạo role "Content Manager" kế thừa từ "User" (id=3)
CM_RESPONSE=$(curl -s -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Manager",
    "key": "content_manager",
    "parent_id": 3
  }')
CM_ID=$(echo $CM_RESPONSE | jq -r '.id')

# 2. Kiểm tra permissions đã được kế thừa
curl -X GET http://localhost:3000/roles/$CM_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.rolePermissions'

# 3. Thêm permissions riêng cho Content Manager
curl -X POST http://localhost:3000/roles/$CM_ID/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [1, 2, 3, 4]
  }'

# 4. Kiểm tra lại - sẽ có permissions từ parent + permissions mới
curl -X GET http://localhost:3000/roles/$CM_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.rolePermissions'
```

---

## Script Test Tự Động

Tạo file `test-roles.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"

# Login admin
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

echo "=== Test 1: Get All Roles ==="
curl -s -X GET "$BASE_URL/roles" \
  -H "Authorization: Bearer $TOKEN" | jq '.items[] | {id, name, key}'

echo -e "\n=== Test 2: Get Role Detail ==="
curl -s -X GET "$BASE_URL/roles/1" \
  -H "Authorization: Bearer $TOKEN" | jq '{id, name, key, permissions: .rolePermissions | length}'

echo -e "\n=== Test 3: Create Role ==="
ROLE_RESPONSE=$(curl -s -X POST $BASE_URL/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Role '$(date +%s)'",
    "key": "test_role_'$(date +%s)'"
  }')
echo $ROLE_RESPONSE | jq
ROLE_ID=$(echo $ROLE_RESPONSE | jq -r '.id')

echo -e "\n=== Test 4: Update Role ==="
curl -s -X PATCH $BASE_URL/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Role"}' | jq

echo -e "\n=== Test 5: Delete Role ==="
curl -s -X DELETE $BASE_URL/roles/$ROLE_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

Chạy script:
```bash
chmod +x test-roles.sh
./test-roles.sh
```

---

## Tiếp Theo

- [Test Permission Management](./04-test-permission-management.md)
- [Test User Role Assignment](./05-test-user-role-assignment.md)
