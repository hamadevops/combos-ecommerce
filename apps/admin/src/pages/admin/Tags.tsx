import { useState } from "react";
import { Plus, Pencil, Search, Tag as TagIcon, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { cn, generateSlug } from "@/lib/utils";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/useTags";
import { Tag } from "@/types/tag";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

const AdminTags = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const { data: tagsData, isLoading } = useTags({ search: searchTerm, limit: 100 });
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const tags = tagsData?.data || [];
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Tag>>({
    name: "",
    slug: "",
  });

  // Search is handled by API/hook or frontend filter if API doesn't support search param on list?
  // Hook supports search param. But for now let's rely on hook.
  // However, if we want client-side filtering on the fetched list:
  const filteredTags = tags; // search is passed to useTags

  const handleEdit = (tag: Tag) => {
    setIsCreating(false);
    setEditingTag(tag);
    setFormData({ ...tag });
  };

  const handleAdd = () => {
    setEditingTag(null);
    setIsCreating(true);
    setFormData({
      name: "",
      slug: "",
    });
  };

  const handleDelete = (id: number) => {
    deleteTag.mutate(id);
  };

  const handleSave = () => {
    if (editingTag) {
      updateTag.mutate(
        { id: editingTag.id, data: { name: formData.name!, slug: formData.slug } },
        {
          onSuccess: () => {
            // Keep form open, just toast or no-op as the query invalidation will refresh list
            // We might want to update the editingTag with new values if they changed,
            // but since we use formData, it's fine.
            // Actually, if we want to reflect the updated state in the form title or elsewhere,
            // we should probably update editingTag.
            // For now, requirement is "Update success -> Do not close tab".
          },
        },
      );
    } else {
      createTag.mutate(
        { name: formData.name!, slug: formData.slug! },
        {
          onSuccess: () => {
            // Reset form for next creation
            setFormData({ name: "", slug: "" });
            // Provide visual feedback or focus? autoFocus is on Input.
          },
        },
      );
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTag(null);
  };

  return (
    <AdminLayout title="Quản lý thẻ (Tags)">
      <div className="h-[calc(100vh-120px)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-full rounded-lg border md:border-0"
        >
          {/* List Column */}
          <ResizablePanel defaultSize={33} minSize={25} maxSize={50}>
            <div className="h-full pr-2">
              <Card className="flex-1 flex flex-col overflow-hidden h-full">
                <CardHeader className="pb-3 border-b flex flex-col gap-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Danh sách thẻ</CardTitle>
                      <CardDescription>Các từ khóa phân loại bài viết</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAdd}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm thẻ..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                      {filteredTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group",
                            editingTag?.id === tag.id ? "bg-muted" : "",
                          )}
                          onClick={() => handleEdit(tag)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                              <TagIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{tag.name}</p>
                              <p className="text-xs text-muted-foreground">{tag.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-muted-foreground mr-2">
                              {(tag as any).postCount || 0} bài
                            </span>
                            <ConfirmDialog
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              title="Xóa thẻ?"
                              description={`Bạn có chắc chắn muốn xóa thẻ "${tag.name}"? Hành động này không thể hoàn tác.`}
                              onConfirm={() => handleDelete(tag.id)}
                            />
                          </div>
                        </div>
                      ))}
                      {filteredTags.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                          {isLoading ? "Đang tải..." : "Không tìm thấy kết quả"}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Info / Edit Column */}
          <ResizablePanel defaultSize={67}>
            <div className="h-full pl-2">
              {isCreating || editingTag ? (
                <Card className="flex-1 flex flex-col overflow-hidden h-full">
                  <CardHeader className="pb-3 border-b shrink-0">
                    <CardTitle>
                      {editingTag ? `Chỉnh sửa: ${formData.name}` : "Thêm thẻ mới"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pt-6">
                    <div className="space-y-4 max-w-lg">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Tên thẻ <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="VD: Thời trang"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="thoi-trang"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            title="Tạo slug từ tên"
                            onClick={() => {
                              if (formData.name) {
                                setFormData({
                                  ...formData,
                                  slug: generateSlug(formData.name || ""),
                                });
                              }
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-refresh-cw"
                            >
                              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                              <path d="M21 3v5h-5" />
                              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                              <path d="M3 21v-5h5" />
                            </svg>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Chuỗi định danh duy nhất trên URL.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex justify-end gap-2 p-4 border-t shrink-0">
                    <Button variant="outline" onClick={handleCancel}>
                      Hủy bỏ
                    </Button>
                    <Button onClick={handleSave}>{editingTag ? "Lưu thay đổi" : "Tạo thẻ"}</Button>
                  </div>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center p-10 text-muted-foreground border-dashed">
                  <div className="text-center">
                    <TagIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Quản lý thẻ bài viết</h3>
                    <p className="max-w-md mx-auto mt-2 mb-6">
                      Chọn một thẻ để chỉnh sửa hoặc thêm mới.
                    </p>
                    <Button onClick={handleAdd}>
                      <Plus className="h-4 w-4 mr-2" /> Tạo thẻ mới
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </AdminLayout>
  );
};

export default AdminTags;
