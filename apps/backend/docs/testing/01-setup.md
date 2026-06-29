# Hướng Dẫn Testing - Setup Ban Đầu

## 1. Chạy Seeders

```bash
# Chạy database seeders để tạo roles, permissions và admin user
npm run seed
```

### Seeders sẽ tạo:
- 5 roles: admin, manager, user, member, guest
- 19 permissions cho products, users, roles, permissions
- Gán permissions cho roles
- Tạo admin user từ `.env`

## 2. Kiểm Tra Database

### Kiểm tra roles đã được tạo
```sql
SELECT * FROM roles;
```

**Expected Result:**
```
+----+---------------+-----------------+------------+
| id | name          | key             | is_default |
+----+---------------+-----------------+------------+
|  1 | Administrator | admin           |          0 |
|  2 | Manager       | manager         |          0 |
|  3 | User          | user            |          1 |
|  4 | Member        | member          |          1 |
|  5 | Guest         | guest           |          0 |
+----+---------------+-----------------+------------+
```

### Kiểm tra permissions đã được tạo
```sql
SELECT * FROM permissions;
```

### Kiểm tra role_permissions
```sql
SELECT r.name as role_name, p.name as permission_name, p.key as permission_key
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.name;
```

### Kiểm tra admin user
```sql
SELECT u.name, u.email, r.name as role_name
FROM users u
JOIN roles r ON u.role_id = r.id;
```

**Expected Result:**
```
+------------+---------------------+---------------+
| name       | email               | role_name     |
+------------+---------------------+---------------+
| Admin User | admin@example.com   | Administrator |
+------------+---------------------+---------------+
```

## 3. Cấu Hình Environment Variables

Đảm bảo file `.env` có các biến sau:

```env
# Admin User Credentials (cho seeder)
ADMIN_NAME=Admin User
EMAIL_ADMIN=admin@example.com
PASSWORD_ADMIN=admin123

# JWT Secret
JWT_SECRET=your-secret-key-here
```

## 4. Kiểm Tra Server Đang Chạy

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server sẽ chạy tại: `http://localhost:3000`

## 5. Tools Cần Thiết

### cURL
```bash
# Kiểm tra cURL đã cài đặt
curl --version
```

### jq (Optional - để parse JSON)
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Kiểm tra
jq --version
```

### Postman (Optional)
Download tại: https://www.postman.com/downloads/

## Tiếp Theo

Sau khi setup xong, bạn có thể:
- [Test Authentication](./02-test-authentication.md)
- [Test Role Management](./03-test-role-management.md)
- [Test Permission Management](./04-test-permission-management.md)
