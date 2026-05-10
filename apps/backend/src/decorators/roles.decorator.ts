import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed to access an endpoint
 * @param roles - Array of role keys (e.g., ['admin', 'manager'])
 * @example
 * ```typescript
 * @Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
 * @Get('admin-only')
 * adminOnlyEndpoint() { ... }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
