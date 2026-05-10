import { useUserStore } from "@/store";

export const usePermission = () => {
  const { user } = useUserStore();

  const hasPermission = (permissions?: string[]): boolean => {
    if (!permissions || permissions.length === 0) return true;
    if (user?.role?.key === "admin") return true;

    // Check rolePermissions first (nested structure: { permission: { key: ... } })
    const rolePerms = user?.role?.rolePermissions;
    if (rolePerms && Array.isArray(rolePerms) && rolePerms.length > 0) {
      return permissions.some((p) =>
        rolePerms.some((rp: any) => (rp.permission?.key || rp.permission?.slug) === p),
      );
    }

    // Fallback to permissions array
    const userPermissions = user?.role?.permissions;
    if (!userPermissions) return false;

    return permissions.some((p) =>
      (userPermissions as (string | { key?: string; slug?: string })[]).some(
        (up) => (typeof up === "string" ? up : up.slug || up.key) === p,
      ),
    );
  };

  return { hasPermission };
};
