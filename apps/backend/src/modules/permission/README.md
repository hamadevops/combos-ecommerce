# Permission Module

Module quản lý roles và permissions cho hệ thống RBAC.

## Chức Năng

### Role Management
- Tạo, đọc, cập nhật, xóa roles
- Hỗ trợ role hierarchy (parent-child)
- Role con tự động kế thừa permissions từ role cha

### Permission Management
- Tạo, đọc permissions
- Gán/xóa permissions cho roles
- Lấy danh sách permissions của user

## API Endpoints

### Roles

#### GET /roles
Lấy danh sách roles với pagination

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `perPage` (number, optional): Số items mỗi trang (default: 20)
- `search` (string, optional): Tìm kiếm theo name hoặc key

**Response:**
```json
{
  "items": [...],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 5,
    "totalPage": 1
  }
}
```

#### GET /roles/:id
Lấy chi tiết role kèm permissions

**Response:**
```json
{
  "id": 1,
  "name": "Administrator",
  "key": "admin",
  "is_default": 0,
  "parent": null,
  "rolePermissions": [...]
}
```

#### POST /roles
Tạo role mới

**Body:**
```json
{
  "name": "Editor",
  "key": "editor",
  "parent_id": 3  // Optional
}
```

#### PATCH /roles/:id
Cập nhật role

**Body:**
```json
{
  "name": "Senior Editor",
  "key": "senior_editor",
  "parent_id": 2,
  "is_default": 0
}
```

#### DELETE /roles/:id
Xóa role (không thể xóa nếu role đang có users)

### Permissions

#### GET /permissions
Lấy danh sách permissions

**Query Parameters:**
- `page`, `perPage`, `search`: Giống như /roles
- `method` (string, optional): Filter theo HTTP method (GET, POST, etc.)

#### POST /permissions
Tạo permission mới

**Body:**
```json
{
  "name": "Create Product",
  "key": "product.create",
  "method": "POST",
  "path": "/products"
}
```

#### POST /roles/:id/permission
Gán permissions cho role

**Body:**
```json
{
  "permissionIds": [1, 2, 3, 4]
}
```

#### DELETE /roles/:roleId/permissions/:permissionId
Xóa permission khỏi role

#### GET /users/:userId/permissions
Lấy tất cả permissions của user

**Response:**
```json
{
  "user": {...},
  "role": {...},
  "permissions": [...]
}
```

## Sử Dụng Trong Code

### Import Service
```typescript
import { PermissionService } from './permission.service';

constructor(private permissionService: PermissionService) {}
```

### Methods

```typescript
// Lấy danh sách roles
await this.permissionService.allRoles({ page: 1, perPage: 20 });

// Lấy chi tiết role
await this.permissionService.detailRole(roleId);

// Tạo role
await this.permissionService.create({
  name: 'Editor',
  key: 'editor',
  parent_id: 3
});

// Cập nhật role
await this.permissionService.updateRole(roleId, {
  name: 'New Name'
});

// Xóa role
await this.permissionService.deleteRole(roleId);

// Lấy permissions
await this.permissionService.getAllPermissions({ page: 1 });

// Tạo permission
await this.permissionService.createPermission({
  name: 'Create Product',
  key: 'product.create',
  method: 'POST',
  path: '/products'
});

// Gán permissions cho role
await this.permissionService.assignPermission(roleId, {
  permissionIds: [1, 2, 3]
});

// Xóa permission khỏi role
await this.permissionService.removePermissionFromRole(roleId, permissionId);

// Lấy permissions của user
await this.permissionService.getUserPermissions(userId);
```

## Testing

Xem file [/docs/RBAC_TESTING_GUIDE.md](../../docs/RBAC_TESTING_GUIDE.md) để biết chi tiết cách test module này.

### Quick Test

```bash
# Login để lấy token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Test lấy danh sách roles
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"

# Test tạo role mới
curl -X POST http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Role",
    "key": "test_role"
  }'
```

## Permissions Required

| Endpoint | Permission | Admin Bypass |
|----------|-----------|--------------|
| GET /roles | `role.read` | ✅ |
| GET /roles/:id | `role.read` | ✅ |
| POST /roles | `role.create` | ✅ |
| PATCH /roles/:id | `role.update` | ✅ |
| DELETE /roles/:id | `role.delete` | ✅ |
| GET /permissions | `permission.read` | ✅ |
| POST /permissions | `permission.create` | ✅ |
| POST /roles/:id/permission | `permission.assign` | ✅ |
| DELETE /roles/:roleId/permissions/:permissionId | `permission.revoke` | ✅ |
| GET /users/:userId/permissions | `user.read` | ✅ |

## Lưu Ý

- Role có `is_default = 1` sẽ được gán tự động cho user mới khi register
- Không thể xóa role đang có users assigned
- Role con tự động kế thừa permissions từ role cha khi tạo
- Admin role (key='admin') có quyền truy cập tất cả endpoints
