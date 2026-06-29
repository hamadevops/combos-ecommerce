import { useState } from "react";
import { Plus, X, Upload, Link as LinkIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/common/ImageUpload";
import { getImageUrl, cn } from "@/lib/utils";
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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SliderItem {
  id?: string;
  image: string | File;
  link: string;
}

interface SliderSettingsInputProps {
  value: SliderItem[];
  onChange: (value: SliderItem[]) => void;
}

// Helper component for sortable item
const SortableSliderItem = ({
  item,
  index,
  onRemove,
  onLinkChange,
}: {
  item: SliderItem;
  index: number;
  onRemove: () => void;
  onLinkChange: (val: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id || `item-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    position: "relative" as "relative",
  };

  const imageUrl =
    item.image instanceof File
      ? URL.createObjectURL(item.image)
      : getImageUrl(item.image as string);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col border rounded-xl bg-card overflow-hidden transition-all h-full",
        isDragging
          ? "shadow-lg scale-[1.02] border-primary/50"
          : "hover:shadow-md hover:border-primary/20",
      )}
    >
      {/* Drag Handle - Top Left */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 z-10 p-1.5 bg-background/80 backdrop-blur-sm rounded-md cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Remove Button - Top Right */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute right-2 top-2 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Image Preview - Top */}
      <div className="w-full aspect-[2/1] bg-muted relative">
        <img src={imageUrl} alt={`Slider detail`} className="w-full h-full object-cover" />
      </div>

      {/* Content - Bottom */}
      <div className="p-3 space-y-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Liên kết
          </Label>
          <div className="relative flex items-center">
            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="/products/..."
              className="pl-8 h-8 text-sm"
              value={item.link}
              onChange={(e) => onLinkChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SliderSettingsInput = ({ value, onChange }: SliderSettingsInputProps) => {
  // Ensure value is always an array
  const items = Array.isArray(value) ? value : [];

  // Ensure every item has an ID for DnD
  const itemsWithIds = items.map((item, idx) => ({
    ...item,
    id: (item as any).id || `slider-${idx}-${Date.now()}`, // Fallback ID generation
  }));

  const [isUploading, setIsUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAddImage = (files: any) => {
    const newFiles = Array.isArray(files) ? files : [files];

    const newItems = newFiles.map((file: any) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      image: file,
      link: "",
    }));

    onChange([...items, ...newItems]);
    setIsUploading(false);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleLinkChange = (index: number, link: string) => {
    const newItems = [...items];
    newItems[index].link = link;
    onChange(newItems);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = itemsWithIds.findIndex((item) => item.id === active.id);
      const newIndex = itemsWithIds.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="space-y-4">
      {itemsWithIds.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemsWithIds.map((i) => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsWithIds.map((item, index) => (
                <SortableSliderItem
                  key={item.id}
                  item={item}
                  index={index}
                  onLinkChange={(val) => handleLinkChange(index, val)}
                  onRemove={() => handleRemove(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {isUploading ? (
        <div className="border border-dashed rounded-xl p-6 bg-muted/30 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-medium text-sm">Tải ảnh lên</h4>
              <p className="text-xs text-muted-foreground">
                Chọn ảnh từ thiết bị của bạn (Tỉ lệ khuyến nghị 2:1)
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsUploading(false)}>
              <X className="h-4 w-4 mr-1" /> Đóng
            </Button>
          </div>
          <ImageUpload
            value={[]}
            onChange={(val) => handleAddImage(val)}
            multiple={true}
            maxFiles={20}
            compact={false}
          />
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-dashed text-muted-foreground hover:bg-muted/50 hover:text-primary hover:border-primary/50 transition-colors"
          onClick={() => setIsUploading(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Thêm slider mới
        </Button>
      )}
    </div>
  );
};
