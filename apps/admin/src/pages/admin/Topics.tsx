import { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  GripVertical,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Topic } from "@/types/topic";
import { useTopicTree, useCreateTopic, useUpdateTopic, useDeleteTopic } from "@/hooks/useTopics";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/rich-text-editor";

// DND Kit
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Helper to flatten topics for parent selection
const flattenTopics = (topics: Topic[], level = 0, result: any[] = []) => {
  topics.forEach((cat) => {
    result.push({ ...cat, level });
    if (cat.children && cat.children.length > 0) {
      flattenTopics(cat.children, level + 1, result);
    }
  });
  return result;
};

// Recursive helper helper to find parent of a node
const findParent = (topics: Topic[], id: number): Topic | null => {
  for (const cat of topics) {
    if (cat.children?.some((child) => child.id === id)) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const found = findParent(cat.children, id);
      if (found) return found;
    }
  }
  return null;
};

const SortableTopicItem = ({
  topic,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
}: {
  topic: Topic;
  depth?: number;
  onEdit: (topic: Topic) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = topic.children && topic.children.length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: topic.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md group cursor-pointer",
          !topic.isActive && "opacity-60",
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onClick={() => onEdit(topic)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:text-foreground text-muted-foreground/50"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Expand Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={cn(
            "p-1 hover:bg-muted rounded-sm transition-colors",
            !hasChildren && "invisible",
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Icon */}
        <div className="text-secondary-foreground/70">
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-indigo-500" />
            ) : (
              <Folder className="h-4 w-4 text-indigo-500" />
            )
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
          )}
        </div>

        {/* Name */}
        <div className="flex-1 font-medium flex items-center gap-2">
          {topic.name}
          {!topic.isActive && (
            <span className="text-[10px] uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              Hidden
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {depth < 2 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(topic.id);
              }}
              title="Thêm chủ đề con"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(topic);
            }}
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(topic)}>Chỉnh sửa</DropdownMenuItem>
              {depth < 2 && (
                <DropdownMenuItem onClick={() => onAddChild(topic.id)}>
                  Thêm chủ đề con
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                    Xóa chủ đề
                  </div>
                }
                title="Xóa chủ đề?"
                description={`Bạn có chắc chắn muốn xóa chủ đề "${topic.name}"?`}
                onConfirm={() => onDelete(topic.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-border/40 ml-[15px] pl-1">
          <SortableContext
            items={topic.children!.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {topic.children!.map((child) => (
              <SortableTopicItem
                key={child.id}
                topic={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const AdminTopics = () => {
  // Queries & Mutations
  const { data: treeData, isLoading } = useTopicTree();
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();

  const topics = treeData?.data || [];

  // Local state for UI only? Or use query cache?
  // We can use the data directly.
  // However, for drag and drop we might need local state or optimistic updates.
  // For now let's use the data from the hook.

  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Compute parent options (Level 0 and 1 only)
  const parentOptions = useMemo(() => {
    const allTopics = flattenTopics(topics);
    return allTopics.filter((t) => {
      // Exclude itself if editing
      if (editingTopic && t.id === editingTopic.id) return false;
      // Exclude levels >= 2 (so max depth is 3: 0, 1, 2)
      return t.level < 2;
    });
  }, [topics, editingTopic]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Simplistic implementation: Just log or toast for now as API reorder support is complex
    // without a dedicated endpoint or batch update.
    // We would need to update the parentId or sortOrder of the active item.

    // Find existing topic to check if parent changed
    // For real implementation we would call updateTopic.mutate(...)
    toast.info("Tính năng sắp xếp đang được cập nhật với API backend.");

    // Optimistic UI updates or complex logic omitted for basic integration
  };

  // Form state
  const [formData, setFormData] = useState<Partial<Topic>>({
    name: "",
    slug: "",
    parentId: null,
    description: "",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const handleEdit = (topic: Topic) => {
    setIsCreating(false);
    setEditingTopic(topic);

    // Ensure parentId is set (it might be missing in tree view children)
    let parentId = topic.parentId;
    if (parentId === undefined) {
      // Fallback for snake_case from backend
      if ((topic as any).parent_id !== undefined) {
        parentId = (topic as any).parent_id;
      } else {
        const parent = findParent(topics, topic.id);
        parentId = parent ? parent.id : null;
      }
    }

    // Map properties to form data (handling potential snake_case from backend)
    setFormData({
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      parentId: parentId,
      isActive: topic.isActive ?? (topic as any).is_active ?? true,
      metaTitle: topic.metaTitle ?? (topic as any).meta_title ?? "",
      metaDescription: topic.metaDescription ?? (topic as any).meta_description ?? "",
      metaKeywords: topic.metaKeywords ?? (topic as any).meta_keywords ?? "",
    });
  };

  const handleAdd = (parentId: number | null = null) => {
    setEditingTopic(null);
    setIsCreating(true);
    setFormData({
      name: "",
      slug: "",
      parentId: parentId,
      description: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });
  };

  const handleDelete = (id: number) => {
    deleteTopic.mutate(id, {
      onSuccess: () => {
        if (editingTopic && editingTopic.id === id) {
          setEditingTopic(null);
          setFormData({
            name: "",
            slug: "",
            parentId: null,
            description: "",
            isActive: true,
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
          });
        }
      },
    });
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Vui lòng nhập tên chủ đề");
      return;
    }

    const topicData: any = {
      name: formData.name,
      description: formData.description,
      parent_id: formData.parentId || null,
      is_active: formData.isActive,
      meta_title: formData.metaTitle,
      meta_description: formData.metaDescription,
      meta_keywords: formData.metaKeywords,
    };

    if (editingTopic) {
      updateTopic.mutate(
        { id: editingTopic.id, data: topicData },
        {
          onSuccess: () => {
            setEditingTopic(null);
            setFormData({
              name: "",
              slug: "",
              parentId: null,
              description: "",
              isActive: true,
              metaTitle: "",
              metaDescription: "",
              metaKeywords: "",
            });
          },
        },
      );
    } else {
      createTopic.mutate(topicData as any, {
        // Cast as any if DTO mismatch slightly
        onSuccess: () => {
          setEditingTopic(null); // Or keep form open? Default to close.
          setFormData({
            name: "",
            slug: "",
            parentId: null, // Reset parentId
            description: "",
            isActive: true,
            metaTitle: "",
            metaDescription: "",
            metaKeywords: "",
          });
          setIsCreating(false);
        },
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTopic(null);
  };

  return (
    <AdminLayout title="Quản lý chủ đề bài viết">
      <div className="h-[calc(100vh-120px)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-full rounded-lg border md:border-0"
        >
          {/* Tree View Column */}
          <ResizablePanel defaultSize={33} minSize={25} maxSize={50}>
            <div className="h-full pr-2">
              <Card className="flex-1 flex flex-col h-full">
                <CardHeader className="pb-3 border-b flex flex-row items-center justify-between shrink-0">
                  <div>
                    <CardTitle>Cây chủ đề</CardTitle>
                    <CardDescription>Kéo thả để sắp xếp</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(null)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-2 overflow-y-auto flex-1">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={topics.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {topics.map((topic) => (
                        <SortableTopicItem
                          key={topic.id}
                          topic={topic}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onAddChild={handleAdd}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Info / Edit Column */}
          <ResizablePanel defaultSize={67}>
            <div className="h-full pl-2">
              {isCreating || editingTopic ? (
                <Card className="flex-1 flex flex-col overflow-hidden h-full">
                  <CardHeader className="pb-3 border-b shrink-0">
                    <CardTitle>
                      {editingTopic ? `Chỉnh sửa: ${formData.name}` : "Thêm chủ đề mới"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pt-6">
                    <Tabs defaultValue="general" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                        <TabsTrigger value="seo">Cấu hình SEO</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Tên chủ đề <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="VD: Khuyến mãi"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Chủ đề cha</Label>
                          <Select
                            value={
                              typeof formData.parentId === "number"
                                ? String(formData.parentId)
                                : "root"
                            }
                            onValueChange={(val) =>
                              setFormData({
                                ...formData,
                                parentId: val === "root" ? null : Number(val),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chủ đề cha" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="root">-- Chủ đề gốc --</SelectItem>
                              {parentOptions.map((t) => (
                                <SelectItem
                                  key={t.id}
                                  value={String(t.id)}
                                  style={{ paddingLeft: `${t.level * 20 + 32}px` }}
                                >
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Mô tả</Label>
                          <RichTextEditor
                            key={editingTopic ? editingTopic.id : "new"}
                            value={formData.description || ""}
                            onChange={(val) => setFormData({ ...formData, description: val })}
                            minHeight={200}
                            maxHeight={400}
                            placeholder="Mô tả chủ đề..."
                          />
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <Switch
                            id="active"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, isActive: checked })
                            }
                          />
                          <Label htmlFor="active">Hiển thị chủ đề này</Label>
                        </div>
                      </TabsContent>

                      <TabsContent value="seo" className="space-y-4 mt-0">
                        <div className="space-y-2">
                          <Label>Meta Title</Label>
                          <Input
                            value={formData.metaTitle || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, metaTitle: e.target.value })
                            }
                            placeholder="Tiêu đề hiển thị trên Google"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Meta Description</Label>
                          <Textarea
                            value={formData.metaDescription || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, metaDescription: e.target.value })
                            }
                            rows={4}
                            placeholder="Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Meta Keywords</Label>
                          <Input
                            value={formData.metaKeywords || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, metaKeywords: e.target.value })
                            }
                            placeholder="tu-khoa-1, tu-khoa-2"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <div className="flex justify-end gap-2 p-4 border-t shrink-0">
                    <Button variant="outline" onClick={handleCancel}>
                      Hủy bỏ
                    </Button>
                    <Button onClick={handleSave}>
                      {editingTopic ? "Lưu thay đổi" : "Tạo chủ đề"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center p-10 text-muted-foreground border-dashed">
                  <div className="text-center">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Quản lý chủ đề bài viết</h3>
                    <p className="max-w-md mx-auto mt-2 mb-6">
                      Chọn một chủ đề để chỉnh sửa hoặc thêm mới.
                    </p>
                    <Button onClick={() => handleAdd(null)}>
                      <Plus className="h-4 w-4 mr-2" /> Tạo chủ đề gốc
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

export default AdminTopics;
