# Decorators

Các decorators để quản lý authentication và authorization.

## @Public()

Đánh dấu endpoint là public, không cần authentication.

**File:** [public.decorator.ts](./public.decorator.ts)

**Sử dụng:**
```typescript
import { Public } from 'src/decorators/public.decorator';

@Public()
@Get('products')
async getProducts() {
  // Endpoint này không cần token
  return this.productsService.findAll();
}
```

**Test:**
```bash
# Không cần token
curl -X GET http://localhost:3000/products

# Với token cũng được
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## @Roles()

Chỉ định roles được phép truy cập endpoint.

**File:** [roles.decorator.ts](./roles.decorator.ts)

**Sử dụng:**
```typescript
import { Roles } from 'src/decorators/roles.decorator';
import { RoleEnum } from 'src/libs/enums/role.enum';

@Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
@Get('admin-dashboard')
async adminDashboard() {
  // Chỉ admin và manager mới truy cập được
  return { message: 'Admin Dashboard' };
}
```

**Test:**
```bash
# Login as admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Access endpoint
curl -X GET http://localhost:3000/admin-dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
# Expected: Success

# Login as regular user
USER_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.access_token')

# Try to access
curl -X GET http://localhost:3000/admin-dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
# Expected: 403 Forbidden
```

---

## @Permissions()

Chỉ định permissions cần thiết để truy cập endpoint.

**File:** [permissions.decorator.ts](./permissions.decorator.ts)

**Sử dụng:**
```typescript
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

@Permissions(PermissionEnum.PRODUCT_CREATE)
@Post('products')
async createProduct(@Body() dto: CreateProductDto) {
  // Chỉ user có permission product.create mới được tạo
  return this.productsService.create(dto);
}

// Có thể chỉ định nhiều permissions (OR logic)
@Permissions(PermissionEnum.PRODUCT_UPDATE, PermissionEnum.PRODUCT_DELETE)
@Patch('products/:id')
async updateProduct(@Param('id') id: number) {
  // User cần có ít nhất 1 trong 2 permissions
  return this.productsService.update(id);
}
```

**Test:**
```bash
# Manager có permission product.create
MANAGER_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"password123"}' \
  | jq -r '.access_token')

curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: Success

# User không có permission
USER_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  | jq -r '.access_token')

curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
# Expected: 403 Forbidden
```

---

## @CurrentUser()

Lấy thông tin user hiện tại từ request.

**File:** [current-user.decorator.ts](./current-user.decorator.ts)

**Sử dụng:**
```typescript
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/responses/jwt.response';

@Get('profile')
async getProfile(@CurrentUser() user: JwtPayload) {
  // user chứa thông tin từ JWT token
  return {
    id: user.sub,
    email: user.email,
    role: user.role
  };
}

// Chỉ lấy một field cụ thể
@Get('my-role')
async getMyRole(@CurrentUser() user: JwtPayload) {
  return { role: user.role.name };
}
```

**Test:**
```bash
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "id": 1,
#   "email": "admin@example.com",
#   "role": {
#     "id": 1,
#     "name": "Administrator",
#     "key": "admin"
#   }
# }
```

---

## Kết Hợp Decorators

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

@UseGuards(JwtAuthGuard)
@Permissions(PermissionEnum.PRODUCT_UPDATE)
@Patch('products/:id')
async updateProduct(
  @Param('id') id: number,
  @Body() dto: UpdateProductDto,
  @CurrentUser() user: JwtPayload
) {
  // Kiểm tra permission + lấy thông tin user
  console.log(`User ${user.email} is updating product ${id}`);
  return this.productsService.update(id, dto);
}
```

## Thứ Tự Ưu Tiên

AuthGuard kiểm tra theo thứ tự:

1. **@Public()** → Cho phép truy cập ngay
2. **Admin role** → Bypass tất cả checks
3. **@Permissions()** → Kiểm tra permission keys
4. **@Roles()** → Kiểm tra roles
5. **Path-based** → Backward compatibility (kiểm tra path + method)

## Best Practices

### 1. Sử dụng @Permissions cho hành động cụ thể

```typescript
// ✅ Good - Rõ ràng về hành động
@Permissions(PermissionEnum.PRODUCT_CREATE)
@Post('products')

// ❌ Bad - Dùng @Roles khi có thể dùng @Permissions
@Roles(RoleEnum.MANAGER)
@Post('products')
```

### 2. Sử dụng @Roles cho nhóm endpoints

```typescript
// ✅ Good - Toàn bộ controller chỉ cho admin
@Roles(RoleEnum.ADMIN)
@Controller('admin')
export class AdminController {
  // Tất cả endpoints đều cần admin role
}
```

### 3. Luôn dùng @UseGuards(JwtAuthGuard)

```typescript
// ✅ Good
@UseGuards(JwtAuthGuard)
@Permissions(PermissionEnum.PRODUCT_CREATE)
@Post('products')

// ❌ Bad - Thiếu guard, decorator không hoạt động
@Permissions(PermissionEnum.PRODUCT_CREATE)
@Post('products')
```

### 4. @Public() không cần @UseGuards

```typescript
// ✅ Good
@Public()
@Get('products')

// ❌ Redundant
@UseGuards(JwtAuthGuard)
@Public()
@Get('products')
```

## Lưu Ý

- Admin role (`key='admin'`) luôn bypass tất cả permission checks
- @Permissions và @Roles có thể dùng cùng lúc, nhưng nên ưu tiên @Permissions
- @CurrentUser chỉ hoạt động khi có token hợp lệ
- Decorators có thể áp dụng ở cả class level và method level
