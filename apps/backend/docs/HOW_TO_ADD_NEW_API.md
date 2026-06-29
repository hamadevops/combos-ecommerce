# Hướng Dẫn Thêm API và Permissions Mới

## Khi Bạn Tạo API Mới

Khi bạn thêm API/endpoint mới vào hệ thống, bạn cần làm 3 bước:

### Bước 1: Thêm Permission Key vào Enum

**File:** `src/libs/enums/permission.enum.ts`

```typescript
export enum PermissionEnum {
  // Existing permissions...
  
  // ✅ Thêm permissions mới cho module của bạn
  ORDER_CREATE = 'order.create',
  ORDER_READ = 'order.read',
  ORDER_UPDATE = 'order.update',
  ORDER_DELETE = 'order.delete',
  ORDER_APPROVE = 'order.approve',  // Custom action
}
```

**Quy tắc đặt tên:**
- Format: `RESOURCE_ACTION`
- Resource: tên resource (ORDER, INVOICE, CATEGORY, etc.)
- Action: hành động (CREATE, READ, UPDATE, DELETE, hoặc custom như APPROVE, EXPORT)
- Value: lowercase với dấu chấm `resource.action`

---

### Bước 2: Thêm Permission vào Seeder

**File:** `src/database/seeders/PermissionSeeder.ts`

Thêm vào mảng `permissions`:

```typescript
const permissions = [
  // Existing permissions...
  
  // ✅ Order permissions
  {
    name: 'Create Order',
    key: PermissionEnum.ORDER_CREATE,
    method: 'POST',
    path: '/orders',
  },
  {
    name: 'Read Order',
    key: PermissionEnum.ORDER_READ,
    method: 'GET',
    path: '/orders',
  },
  {
    name: 'Update Order',
    key: PermissionEnum.ORDER_UPDATE,
    method: 'PATCH',
    path: '/orders/:id',
  },
  {
    name: 'Delete Order',
    key: PermissionEnum.ORDER_DELETE,
    method: 'DELETE',
    path: '/orders/:id',
  },
  {
    name: 'Approve Order',
    key: PermissionEnum.ORDER_APPROVE,
    method: 'POST',
    path: '/orders/:id/approve',
  },
];
```

**Chạy seeder lại:**
```bash
npm run seed
```

Seeder sẽ tự động:
- ✅ Tạo permissions mới
- ✅ Skip permissions đã tồn tại
- ✅ Không bị lỗi duplicate

---

### Bước 3: Áp Dụng @Permissions Decorator vào Controller

**File:** `src/modules/orders/orders.controller.ts`

```typescript
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ORDER_CREATE)
  async createOrder(@Body() dto: CreateOrderDto) {
    // Chỉ user có permission order.create mới được tạo
    return this.ordersService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ORDER_READ)
  async getAllOrders() {
    return this.ordersService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ORDER_UPDATE)
  async updateOrder(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ORDER_DELETE)
  async deleteOrder(@Param('id') id: number) {
    return this.ordersService.delete(id);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ORDER_APPROVE)
  async approveOrder(@Param('id') id: number) {
    return this.ordersService.approve(id);
  }
}
```

---

## Gán Permissions Cho Roles

### Option 1: Thêm vào RolePermissionSeeder (Recommended)

**File:** `src/database/seeders/RolePermissionSeeder.ts`

Thêm permissions mới vào các roles phù hợp:

```typescript
// Manager gets order management permissions
const managerPermissionKeys = [
  // Existing permissions...
  PermissionEnum.ORDER_CREATE,
  PermissionEnum.ORDER_READ,
  PermissionEnum.ORDER_UPDATE,
  PermissionEnum.ORDER_DELETE,
  PermissionEnum.ORDER_APPROVE,  // Manager có thể approve
];

// User gets read-only permissions
const userPermissionKeys = [
  // Existing permissions...
  PermissionEnum.ORDER_READ,  // User chỉ xem được
];
```

Sau đó chạy lại seeder:
```bash
npm run seed
```

### Option 2: Gán Qua API (Runtime)

```bash
# Lấy admin token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# Lấy ID của permissions mới (ví dụ: 20, 21, 22, 23, 24)
# Gán cho Manager role (id=2)
curl -X POST http://localhost:3000/roles/2/permission \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissionIds": [20, 21, 22, 23, 24]
  }'
```

---

## Ví Dụ Hoàn Chỉnh: Thêm Category Module

### 1. Thêm vào PermissionEnum
```typescript
// src/libs/enums/permission.enum.ts
export enum PermissionEnum {
  // ... existing

  // Category permissions
  CATEGORY_CREATE = 'category.create',
  CATEGORY_READ = 'category.read',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',
}
```

### 2. Thêm vào PermissionSeeder
```typescript
// src/database/seeders/PermissionSeeder.ts
const permissions = [
  // ... existing
  
  // Category permissions
  {
    name: 'Create Category',
    key: PermissionEnum.CATEGORY_CREATE,
    method: 'POST',
    path: '/categories',
  },
  {
    name: 'Read Category',
    key: PermissionEnum.CATEGORY_READ,
    method: 'GET',
    path: '/categories',
  },
  {
    name: 'Update Category',
    key: PermissionEnum.CATEGORY_UPDATE,
    method: 'PATCH',
    path: '/categories/:id',
  },
  {
    name: 'Delete Category',
    key: PermissionEnum.CATEGORY_DELETE,
    method: 'DELETE',
    path: '/categories/:id',
  },
];
```

### 3. Chạy Seeder
```bash
npm run seed
```

Output:
```
- Role already exists: Administrator
- Role already exists: Manager
✓ Created permission: Create Category
✓ Created permission: Read Category
✓ Created permission: Update Category
✓ Created permission: Delete Category
```

### 4. Tạo Controller
```typescript
// src/modules/categories/categories.controller.ts
import { Controller, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('categories')
export class CategoriesController {
  
  @Get()
  @Public()  // Public endpoint - không cần permission
  async getAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.CATEGORY_CREATE)
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.CATEGORY_UPDATE)
  async update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.CATEGORY_DELETE)
  async delete(@Param('id') id: number) {
    return this.categoriesService.delete(id);
  }
}
```

### 5. Gán Permissions (Option A: Via Seeder)
```typescript
// src/database/seeders/RolePermissionSeeder.ts
const managerPermissionKeys = [
  // ... existing
  PermissionEnum.CATEGORY_CREATE,
  PermissionEnum.CATEGORY_READ,
  PermissionEnum.CATEGORY_UPDATE,
  PermissionEnum.CATEGORY_DELETE,
];
```

Chạy lại: `npm run seed`

### 6. Test
```bash
# Manager có thể tạo category
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics"}'
# ✅ Success

# User không thể tạo category
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics"}'
# ❌ 403 Forbidden
```

---

## Best Practices

### 1. Đặt Tên Permission Keys Nhất Quán
```typescript
// ✅ Good
PRODUCT_CREATE = 'product.create'
ORDER_CREATE = 'order.create'
CATEGORY_CREATE = 'category.create'

// ❌ Bad - không nhất quán
PRODUCT_ADD = 'product.add'
CREATE_ORDER = 'create.order'
```

### 2. Nhóm Permissions Theo Resource
```typescript
// ✅ Good - dễ tìm
// Product permissions
PRODUCT_CREATE = 'product.create',
PRODUCT_READ = 'product.read',
PRODUCT_UPDATE = 'product.update',
PRODUCT_DELETE = 'product.delete',

// Order permissions
ORDER_CREATE = 'order.create',
ORDER_READ = 'order.read',
```

### 3. Sử dụng Public Cho Endpoints Không Cần Auth
```typescript
// ✅ Good - rõ ràng
@Public()
@Get('products')

// ❌ Bad - không cần permission cho public endpoint
@Permissions(PermissionEnum.PRODUCT_READ)
@Get('products')
```

### 4. Luôn Chạy Seeder Sau Khi Thêm Permissions
```bash
# Workflow
1. Thêm vào PermissionEnum
2. Thêm vào PermissionSeeder
3. npm run seed  ← QUAN TRỌNG
4. Thêm decorator vào controller
5. Test
```

---

## Troubleshooting

### Lỗi: Permission not found
**Nguyên nhân:** Chưa chạy seeder sau khi thêm permission mới

**Giải pháp:**
```bash
npm run seed
```

### Lỗi: 403 Forbidden
**Nguyên nhân:** User không có permission

**Giải pháp:**
```bash
# Kiểm tra permissions của user
curl -X GET http://localhost:3000/users/1/permissions \
  -H "Authorization: Bearer $TOKEN"

# Gán permission cho role
curl -X POST http://localhost:3000/roles/2/permission \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissionIds":[20]}'
```

### Seeder Bị Lỗi Duplicate
**Nguyên nhân:** Seeders cũ không idempotent

**Giải pháp:** Seeders mới đã được sửa để idempotent, chạy lại:
```bash
npm run seed
```

---

## Checklist Khi Thêm API Mới

- [ ] Thêm permission keys vào `PermissionEnum`
- [ ] Thêm permissions vào `PermissionSeeder`
- [ ] Chạy `npm run seed`
- [ ] Thêm `@Permissions()` decorator vào controller
- [ ] Thêm `@UseGuards(JwtAuthGuard)` nếu cần auth
- [ ] Gán permissions cho roles phù hợp
- [ ] Test với các roles khác nhau
- [ ] Cập nhật documentation (nếu cần)

---

## Tóm Tắt

**3 bước đơn giản:**
1. **Enum** → Thêm permission key
2. **Seeder** → Thêm permission data + chạy `npm run seed`
3. **Controller** → Thêm `@Permissions()` decorator

Hệ thống sẽ tự động:
- ✅ Kiểm tra permissions khi request
- ✅ Admin bypass tất cả
- ✅ Seeders không bị duplicate khi chạy lại
