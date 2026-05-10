import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  FileText,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mockPages, Page } from "@/data/mockPages";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface SortableRowProps {
  page: Page;
  navigate: any;
  handleDelete: (id: string) => void;
}

const SortableRow = ({ page, navigate, handleDelete }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted opacity-80" : ""}>
      <TableCell className="w-[50px] text-center">
        <Button variant="ghost" size="icon" className="cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TableCell>
      <TableCell className="font-medium flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        {page.title}
      </TableCell>
      <TableCell className="text-muted-foreground">{page.slug}</TableCell>
      <TableCell>
        <Badge variant={page.status === "published" ? "secondary" : "outline"}>
          {page.status === "published" ? "Công khai" : "Nháp"}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-sm text-muted-foreground">
        {new Date(page.updatedAt).toLocaleDateString("vi-VN")}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/pages/edit/${page.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/${page.slug}`, "_blank")}>
              <Globe className="mr-2 h-4 w-4" /> Xem trang
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmDialog
              trigger={
                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                </div>
              }
              title="Xóa trang?"
              description={`Bạn có chắc chắn muốn xóa trang "${page.title}"?`}
              onConfirm={() => handleDelete(page.id)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const AdminPages = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>(
    mockPages.sort((a, b) => (a.order || 0) - (b.order || 0)),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Re-assign order based on new index
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
      toast.success("Đã cập nhật thứ tự trang");
    }
  };

  const handleDelete = (id: string) => {
    setPages(pages.filter((p) => p.id !== id));
    toast.success("Đã xóa trang");
  };

  return (
    <AdminLayout title="Quản lý trang">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách trang</CardTitle>
              <CardDescription>Kéo thả để sắp xếp thứ tự hiển thị menu</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm trang..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild>
                <Link to="/pages/create">
                  <Plus className="mr-2 h-4 w-4" /> Thêm trang
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="overflow-auto h-full">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[400px]">Tiêu đề</TableHead>
                    <TableHead>Đường dẫn (Slug)</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Cập nhật cuối</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={filteredPages.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredPages.map((page) => (
                      <SortableRow
                        key={page.id}
                        page={page}
                        navigate={navigate}
                        handleDelete={handleDelete}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPages;
