# Hướng Dẫn Testing RBAC

Hệ thống testing cho Role-Based Access Control đã được tách thành các file riêng biệt.

## 📚 Danh Sách Hướng Dẫn

1. **[Setup](./01-setup.md)** - Cấu hình ban đầu, chạy seeders
2. **[Authentication](./02-test-authentication.md)** - Test login, register
3. **[Role Management](./03-test-role-management.md)** - Test CRUD roles
4. **[Permission Management](./04-test-permission-management.md)** - Test CRUD permissions
5. **[Authorization](./06-test-authorization.md)** - Test phân quyền

## 🚀 Quick Start

```bash
# 1. Chạy seeders
npm run seed

# 2. Lấy admin token
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.access_token')

# 3. Test endpoint
curl -X GET http://localhost:3000/roles \
  -H "Authorization: Bearer $TOKEN"
```

Xem chi tiết trong từng file hướng dẫn!
