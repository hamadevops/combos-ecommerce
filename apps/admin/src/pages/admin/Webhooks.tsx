import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { webhookService } from "@/services/webhook.service";
import { AdminWebhookForm } from "./AdminWebhookForm";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { components } from "@/docs/api-types";
import { useUserStore } from "@/store/useUserStore";
import { PermissionEnum } from "@/constants/permissions";

type Webhook = components["schemas"]["Webhook"];

export default function Webhooks() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | undefined>(undefined);
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  // Helper to check permission
  const hasPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    if (user?.role?.key === "admin") return true;

    // Check rolePermissions first (nested structure: { permission: { key: ... } })
    const rolePerms = (user?.role as any)?.rolePermissions;
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

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["webhooks"],
    queryFn: webhookService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: webhookService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Tạo webhook thành công");
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo webhook");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => webhookService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Cập nhật webhook thành công");
      setIsOpen(false);
      setEditingWebhook(undefined);
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật webhook");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => webhookService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      toast.success("Xóa webhook thành công");
    },
    onError: (error: any) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa webhook");
    },
  });

  const handleCreate = () => {
    setEditingWebhook(undefined);
    setIsOpen(true);
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa webhook này?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (webhook: Webhook) => {
    if (!hasPermission([PermissionEnum.WEBHOOK_UPDATE])) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }
    updateMutation.mutate({
      id: webhook.id,
      data: { isEnabled: !webhook.isEnabled },
    });
  };

  const handleSubmit = (data: any) => {
    if (editingWebhook) {
      updateMutation.mutate({ id: editingWebhook.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <AdminLayout title="Webhooks">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Danh sách Webhook</CardTitle>
            <CardDescription>
              Quản lý các webhook để tích hợp với hệ thống bên ngoài
            </CardDescription>
          </div>
          {hasPermission([PermissionEnum.WEBHOOK_CREATE]) && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" /> Tạo Webhook
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : webhooks?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Chưa có webhook nào được tạo
                  </TableCell>
                </TableRow>
              ) : (
                webhooks?.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-medium">{webhook.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Globe className="w-3 h-3" />
                        <span className="truncate max-w-[200px]" title={webhook.url}>
                          {webhook.url}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {(() => {
                          let count = 0;
                          if (Array.isArray(webhook.events)) {
                            count = webhook.events.length;
                          } else if (typeof webhook.events === "string") {
                            try {
                              const parsed = JSON.parse(webhook.events);
                              count = Array.isArray(parsed) ? parsed.length : 0;
                            } catch (e) {
                              count = 0;
                            }
                          }
                          return `${count} sự kiện`;
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={webhook.isEnabled}
                          onCheckedChange={() => handleToggleStatus(webhook)}
                          disabled={!hasPermission([PermissionEnum.WEBHOOK_UPDATE])}
                        />
                        <span className="text-sm">
                          {webhook.isEnabled ? "Đang bật" : "Đang tắt"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission([PermissionEnum.WEBHOOK_UPDATE]) && (
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(webhook)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission([PermissionEnum.WEBHOOK_DELETE]) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDelete(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingWebhook ? "Cập nhật Webhook" : "Tạo Webhook mới"}</SheetTitle>
            <SheetDescription>
              {editingWebhook
                ? "Chỉnh sửa thông tin webhook hiện có."
                : "Thêm webhook mới để nhận thông báo về các sự kiện."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AdminWebhookForm
              initialData={editingWebhook}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              onCancel={() => setIsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
