import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify which permissions are required to access an endpoint
 * @param permissions - Array of permission keys (e.g., ['product.create', 'product.update'])
 * @example
 * ```typescript
 * @Permissions(PermissionEnum.PRODUCT_CREATE)
 * @Post('products')
 * createProduct() { ... }
 * ```
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
