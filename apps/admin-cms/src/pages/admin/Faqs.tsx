import { useState } from "react";
import { Plus, Edit, Trash2, HelpCircle, MoreHorizontal, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { mockFaqs, FAQ } from "@/data/mockFaqs";
import { toast } from "sonner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  faq: FAQ;
  navigate: any;
  handleDelete: (id: string) => void;
}

const SortableRow = ({ faq, navigate, handleDelete }: SortableRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: faq.id,
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
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          {faq.question}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground truncate max-w-xs">{faq.answer}</TableCell>
      <TableCell>
        <Badge variant={faq.isActive ? "default" : "secondary"}>
          {faq.isActive ? "Hoạt động" : "Ẩn"}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/faqs/edit/${faq.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <ConfirmDialog
              trigger={
                <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                </div>
              }
              title="Xóa câu hỏi?"
              description={`Bạn có chắc chắn muốn xóa câu hỏi "${faq.question}"?`}
              onConfirm={() => handleDelete(faq.id)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const AdminFaqs = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQ[]>(mockFaqs.sort((a, b) => a.order - b.order));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFaqs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order field based on new index
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
      toast.success("Đã cập nhật thứ tự");
    }
  };

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
    toast.success("Đã xóa câu hỏi");
  };

  return (
    <AdminLayout title="Quản lý FAQs">
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Danh sách câu hỏi thường gặp</CardTitle>
              <CardDescription>Kéo thả để sắp xếp thứ tự hiển thị</CardDescription>
            </div>
            <Button asChild>
              <Link to="/faqs/create">
                <Plus className="mr-2 h-4 w-4" /> Thêm câu hỏi
              </Link>
            </Button>
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
                    <TableHead className="w-[50px] text-center"></TableHead>
                    <TableHead className="w-[400px]">Câu hỏi</TableHead>
                    <TableHead>Câu trả lời ngắn</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={faqs.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {faqs.map((faq) => (
                      <SortableRow
                        key={faq.id}
                        faq={faq}
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

export default AdminFaqs;
