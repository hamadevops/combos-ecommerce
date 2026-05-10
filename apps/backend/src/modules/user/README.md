# User Module

Module quản lý users trong hệ thống.

## Chức Năng

- Register user mới
- Cập nhật role cho user
- Lấy thông tin user với permissions

## API Endpoints

### POST /users/register

Đăng ký user mới (Public endpoint - không cần token)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Lưu ý:**
- User mới sẽ được gán role mặc định (member/user)
- Response trả về luôn access_token để user có thể login ngay
- Email phải unique

### PATCH /users/:id/role

Cập nhật role cho user

**Permission Required:** `user.update.role` hoặc Admin

**Request Body:**
```json
{
  "roleId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": {
    "id": 2,
    "name": "Manager",
    "key": "manager"
  }
}
```

### GET /users/:id/permissions

Lấy thông tin user kèm tất cả permissions

**Permission Required:** `user.read` hoặc Admin

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": {
    "id": 2,
    "name": "Manager",
    "key": "manager"
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

## Testing

### Test Register

```bash
# Register user mới
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123"
  }'

# Expected: Trả về access_token
```

**Test Cases:**
- ✅ Register thành công với email mới
- ❌ Register với email đã tồn tại → Error "Email already in use"
- ❌ Register với dữ liệu thiếu → Validation error

### Test Update User Role

```bash
# Login admin để lấy token
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Cập nhật role cho user
curl -X PATCH http://localhost:3000/users/2/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 2
  }'
```

**Test Cases:**
- ✅ Admin cập nhật role thành công
- ❌ User thường cập nhật role → 403 Forbidden
- ❌ Role không tồn tại → Error "Role not found"
- ❌ User không tồn tại → Error "User not found"

### Test Get User Permissions

```bash
# Lấy permissions của user
curl -X GET http://localhost:3000/users/2/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Test Cases:**
- ✅ Admin/Manager lấy permissions của user khác
- ✅ User lấy permissions của chính mình
- ❌ User không có permission → 403 Forbidden

## Workflow: Thay Đổi Role Của User

```bash
# 1. User register với role mặc định (member)
REGISTER_RESPONSE=$(curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123"
  }')

USER_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')

# 2. User thử tạo product → Fail (không có permission)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 403 Forbidden

# 3. Admin cập nhật role cho user thành Manager
curl -X PATCH http://localhost:3000/users/3/role \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": 2
  }'

# 4. User login lại để lấy token mới
NEW_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}' \
  | jq -r '.access_token')

# 5. User thử tạo product lại → Success
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 201 Created
```

## Sử Dụng Trong Code

```typescript
import { UserService } from './user.service';

constructor(private userService: UserService) {}

// Register user
const result = await this.userService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});
// Returns: { access_token: '...' }

// Cập nhật role
const user = await this.userService.updateUserRole(userId, roleId);
// Returns: User object with new role

// Lấy user với permissions
const userWithPerms = await this.userService.getUserWithPermissions(userId);
// Returns: User object with role and permissions array
```

## Permissions Required

| Endpoint | Permission | Admin Bypass |
|----------|-----------|--------------|
| POST /users/register | Public | - |
| PATCH /users/:id/role | `user.update.role` | ✅ |
| GET /users/:id/permissions | `user.read` | ✅ |

## Lưu Ý

- User mới được gán role có `is_default = 1` (thường là member hoặc user)
- Sau khi cập nhật role, user cần login lại để lấy token mới với permissions mới
- Không thể xóa user trong module này (chưa implement)
- Password được hash tự động khi register
