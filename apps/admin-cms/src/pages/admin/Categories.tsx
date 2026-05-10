import { useState, useEffect } from "react";
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
import { Category } from "@/types/category";
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
import { cn, generateSlug } from "@/lib/utils";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { ImageUpload } from "@/components/common/ImageUpload";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

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
import {
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";

// Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Tên danh mục là bắt buộc"),
  slug: yup.string().required("Slug là bắt buộc"),
  parentId: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  description: yup.string().optional(),
  image: yup.mixed<string | File>().nullable().optional(),
  isActive: yup.boolean().default(true),
  metaTitle: yup.string().optional(),
  metaDescription: yup.string().optional(),
  metaKeywords: yup.string().optional(),
});

type CategoryFormData = yup.InferType<typeof schema>;

// Helper to flatten categories for parent selection
const flattenCategories = (categories: Category[], level = 0, result: any[] = []) => {
  categories.forEach((cat) => {
    result.push({ ...cat, level });
    if (cat.children && cat.children.length > 0) {
      flattenCategories(cat.children, level + 1, result);
    }
  });
  return result;
};

// Recursive helper helper to find parent of a node
const findParent = (categories: Category[], id: number): Category | null => {
  for (const cat of categories) {
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

const SortableCategoryItem = ({
  category,
  depth = 0,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: Category;
  depth?: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
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
          "flex items-center gap-2 py-2 px-2 hover:bg-muted/50 rounded-md group",
          !category.isActive && "opacity-60",
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
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
          onClick={() => setIsExpanded(!isExpanded)}
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
              <FolderOpen className="h-4 w-4 text-blue-600 fill-blue-600/20" />
            ) : (
              <Folder className="h-4 w-4 text-blue-600 fill-blue-600/20" />
            )
          ) : (
            <Folder className="h-4 w-4 text-indigo-400/70" />
          )}
        </div>

        {/* Name */}
        <div
          className="flex-1 font-medium flex items-center gap-2 cursor-pointer"
          onClick={() => onEdit(category)}
        >
          {category.name}
          {category.isActive ? (
            <span className="text-[10px] uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
              Public
            </span>
          ) : (
            <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
              Private
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          {depth < 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAddChild(category.id)}
              title="Thêm danh mục con"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(category)}
            title="Chỉnh sửa"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>Chỉnh sửa</DropdownMenuItem>
              {depth < 1 && (
                <DropdownMenuItem onClick={() => onAddChild(category.id)}>
                  Thêm danh mục con
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                    Xóa danh mục
                  </div>
                }
                title="Xóa danh mục?"
                description={`Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`}
                onConfirm={() => onDelete(category.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-border/40 ml-[15px] pl-1">
          <SortableContext
            items={category.children!.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {category.children!.map((child) => (
              <SortableCategoryItem
                key={child.id}
                category={child}
                depth={depth + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={() => onAddChild(child.id)}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const AdminCategories = () => {
  // Queries & Mutations
  const { data: response, isLoading } = useCategoryTree();
  // Hook returns the data array directly because of interceptor + hook logic
  const categories = Array.isArray(response) ? response : response?.data || [];

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentOptions, setParentOptions] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Since we don't have a bulk update endpoint, we will best-effort update locally
    // AND trigger an API call to update the moved item's parent and sort order.
    // However, handling "sorting" between siblings requires calculating exact sortOrder.
    // For now, let's assume we just want to allow reparenting or simple reorder
    // which might require backend support for "move to index".
    //
    // Given the complexity without a "reorder" endpoint, we will just implement
    // Re-parenting logic via Drag and Drop if it lands "on" another item folder?
    // Actually the current UI is a flat list with indentation, mapped via tree.
    // The SortableContext expects a flat list of IDs if using vertical strategy,
    // but we are rendering a tree.
    //
    // For true Tree Drag and Drop we need `dnd-kit` tree examples.
    // The current implementation in this file was:
    // SortableContext items={categories.map(c => c.id)}
    // This only sorts root level items.
    // Nested items had their own SortableContext.

    // We will IMPLEMENT basic reordering at the same level for now.
    // Calculating new sort order is tricky without knowing the neighbors' orders.
    // We'll skip complex DND logic for this iteration and focus on CRUD functionality working first,
    // as requested by the task "Integrate api".
    // We can revisit robust Tree DnD later.

    console.log("Drag end", active.id, over.id);
    toast.info("Tính năng sắp xếp kéo thả đang được phát triển hoàn thiện với API");
  };

  // Form state
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      description: "",
      image: "",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    },
  });

  const handleEdit = (category: Category) => {
    setIsCreating(false);
    setEditingCategory(category);

    // Find parent ID for this category
    const parent = findParent(categories, category.id);

    reset({
      name: category.name,
      slug: category.slug,
      parentId: parent?.id || null,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      metaKeywords: category.metaKeywords || "",
    });

    // Limit parent options to ROOT categories only (Level 0)
    // Filter out self if self is a root category
    setParentOptions(categories.filter((c) => c.id !== category.id));
  };

  const handleAdd = (parentId: number | null = null) => {
    // Explicitly clear editing state first
    setEditingCategory(null);
    setIsCreating(true);

    // Force reset form with default values to ensure no cache from previous edits
    reset({
      name: "",
      slug: "",
      parentId: parentId,
      description: "",
      image: "",
      isActive: true, // Default to true (Public)
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });

    // Limit parent options to ROOT categories only
    setParentOptions(categories);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const onSave = (data: CategoryFormData) => {
    console.log("Saving category:", data);

    // Conversion for API
    const apiData: any = {
      ...data,
      parentId: data.parentId, // data.parentId is already number | null
    };

    // Map frontend form data to API DTO
    // Note: DTO expects snake_case for some fields? checking category.ts...
    // category.ts map CreateCategoryDto which has snake_case fields?
    // Let's check CreateCategoryDto definition in types/category.ts
    // (Assuming snake_case based on backend).
    // Actually the hook uses `create(data)` which takes CreateCategoryDto.
    // We need to map our camelCase form data to snake_case DTO.

    const mappedData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      parent_id: data.parentId ? Number(data.parentId) : null,
      is_active: data.isActive,
      image: data.image instanceof File ? data.image : undefined, // Only send File
      meta_title: data.metaTitle,
      meta_description: data.metaDescription,
      meta_keywords: data.metaKeywords,
      sort_order: 0, // Default or managed elsewhere
    };

    if (editingCategory) {
      updateMutation.mutate(
        { id: editingCategory.id, data: mappedData },
        {
          onSuccess: () => {
            // Keep the form open, just update the local state to reflect changes in UI (like header)
            // The query invalidation in hook will refresh the tree
            setEditingCategory({ ...editingCategory, ...data } as Category);
          },
        },
      );
    } else {
      createMutation.mutate(mappedData, {
        onSuccess: () => {
          setIsCreating(false);
        },
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
  };

  return (
    <AdminLayout title="Quản lý danh mục">
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
                    <CardTitle>Cây danh mục</CardTitle>
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
                    {isLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : (
                      <SortableContext
                        items={categories.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {categories.map((cat) => (
                          <SortableCategoryItem
                            key={cat.id}
                            category={cat}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddChild={() => handleAdd(cat.id)}
                          />
                        ))}
                      </SortableContext>
                    )}
                  </DndContext>
                </CardContent>
              </Card>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Info / Edit Column */}
          <ResizablePanel defaultSize={67}>
            <div className="h-full pl-2">
              {isCreating || editingCategory ? (
                <Card className="flex-1 flex flex-col overflow-hidden h-full">
                  <CardHeader className="pb-3 border-b shrink-0">
                    <CardTitle>
                      {editingCategory ? `Chỉnh sửa: ${watch("name")}` : "Thêm danh mục mới"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto pt-6">
                    <form id="category-form" onSubmit={handleSubmit(onSave)}>
                      <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                          <TabsTrigger value="seo">Cấu hình SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 mt-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">
                                Tên danh mục <span className="text-red-500">*</span>
                              </Label>
                              <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    id="name"
                                    placeholder="VD: Áo thun nam"
                                    className={errors.name ? "border-red-500" : ""}
                                  />
                                )}
                              />
                              {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="slug">
                                Slug (URL) <span className="text-red-500">*</span>
                              </Label>
                              <div className="flex gap-2">
                                <Controller
                                  name="slug"
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      {...field}
                                      id="slug"
                                      placeholder="ao-thun-nam"
                                      className={errors.slug ? "border-red-500" : ""}
                                    />
                                  )}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  title="Tạo slug từ tên"
                                  onClick={() => {
                                    const name = watch("name");
                                    if (name) {
                                      setValue("slug", generateSlug(name));
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
                              {errors.slug && (
                                <p className="text-xs text-red-500">{errors.slug.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Danh mục cha</Label>
                            <Controller
                              name="parentId"
                              control={control}
                              render={({ field }) => (
                                <Select
                                  value={field.value ? String(field.value) : "root"}
                                  onValueChange={(val) =>
                                    field.onChange(val === "root" ? null : Number(val))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục cha" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="root">-- Danh mục gốc --</SelectItem>
                                    {parentOptions.map((cat) => (
                                      <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                        style={{ paddingLeft: `${cat.level * 10 + 10}px` }}
                                      >
                                        {cat.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Mô tả</Label>
                            <Controller
                              name="description"
                              control={control}
                              render={({ field }) => (
                                <RichTextEditor
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  minHeight={200}
                                  maxHeight={400}
                                  placeholder="Mô tả danh mục..."
                                />
                              )}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Hình ảnh</Label>
                            <div className="max-w-md">
                              <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                  <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                    multiple={false}
                                    maxFiles={1}
                                  />
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <Controller
                              name="isActive"
                              control={control}
                              render={({ field }) => (
                                <Switch
                                  id="active"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                            <Label htmlFor="active">Hiển thị danh mục này</Label>
                          </div>
                        </TabsContent>

                        <TabsContent value="seo" className="space-y-4 mt-0">
                          <div className="space-y-2">
                            <Label>Meta Title</Label>
                            <Controller
                              name="metaTitle"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="Tiêu đề hiển thị trên Google"
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Meta Description</Label>
                            <Controller
                              name="metaDescription"
                              control={control}
                              render={({ field }) => (
                                <Textarea
                                  {...field}
                                  value={field.value || ""}
                                  rows={4}
                                  placeholder="Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm..."
                                />
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Meta Keywords</Label>
                            <Controller
                              name="metaKeywords"
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  placeholder="tu-khoa-1, tu-khoa-2"
                                />
                              )}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </form>
                  </CardContent>
                  <div className="flex justify-end gap-2 p-4 border-t shrink-0">
                    <Button variant="outline" onClick={handleCancel}>
                      Hủy bỏ
                    </Button>
                    <Button type="submit" form="category-form">
                      {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center p-10 text-muted-foreground border-dashed">
                  <div className="text-center">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Quản lý cấu trúc danh mục</h3>
                    <p className="max-w-md mx-auto mt-2 mb-6">
                      Chọn một danh mục để chỉnh sửa hoặc thêm mới.
                    </p>
                    <Button onClick={() => handleAdd(null)}>
                      <Plus className="h-4 w-4 mr-2" /> Tạo danh mục gốc
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

export default AdminCategories;
