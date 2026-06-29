import { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import { ShieldAlert } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: string[];
}

export const PermissionGuard = ({ children, permissions }: PermissionGuardProps) => {
  const { hasPermission } = usePermission();

  if (!hasPermission(permissions)) {
    return (
      <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Truy cập bị từ chối</h2>
          <p className="text-muted-foreground mx-auto max-w-sm">
            Bạn không có đủ quyền hạn để xem trang này. Vui lòng liên hệ Quản trị viên để được cấp quyền!
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
