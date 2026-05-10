import React, { useCallback, useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Crop as CropIcon } from "lucide-react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { cn, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
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
import getCroppedImg from "@/lib/canvasUtils";

interface ImageUploadProps {
  value: (string | File)[] | string | File | null;
  onChange: (value: (string | File)[] | string | File | null) => void;
  disabled?: boolean;
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
  compact?: boolean;
}

// Helper to center crop initially
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImagePreview = ({
  file,
  alt,
  className,
  style,
}: {
  file: string | File;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    if (typeof file === "string") {
      setPreview(getImageUrl(file) || "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) {
    return <div className={cn("bg-muted animate-pulse", className)} style={style} />;
  }

  return <img loading="lazy" decoding="async" src={preview} alt={alt} className={className} style={style} />;
};

interface SortableImageProps {
  id: string;
  item: string | File;
  onRemove: (item: string | File) => void;
  disabled?: boolean;
}

const SortableImage = ({ id, item, onRemove, disabled }: SortableImageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square rounded-md overflow-hidden border bg-background"
      {...attributes}
      {...listeners}
    >
      <ImagePreview file={item} alt="Upload preview" className="object-cover w-full h-full" />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation(); // prevent drag start if clicking remove?
          // Actually remove button needs to capture click.
          // DnD listeners are on the div.
          // We might need onPointerDown extraction if button click propagates.
          onRemove(item);
        }}
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button
        disabled={disabled}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled,
  maxFiles = 5,
  multiple = false,
  className,
  compact = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cropping state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [zoom, setZoom] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array
  const values = Array.isArray(value) ? value : value ? [value] : [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Add distance to prevent drag on click
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getId = useCallback((item: string | File) => {
    if (typeof item === "string") return item;
    return `file-${item.name}-${item.size}`;
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = values.findIndex((item) => getId(item) === active.id);
      const newIndex = values.findIndex((item) => getId(item) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(values, oldIndex, newIndex));
      }
    }
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    // Default to 16:9 but allow free resizing
    setCrop(centerAspectCrop(width, height, 16 / 9));
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !completedCrop || !imgRef.current) return;

    setIsUploading(true);
    try {
      // Need to pass the Image DOM element or source to getCroppedImg
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const pixelCropOnNatural = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      const croppedImageBlob = await getCroppedImg(imageToCrop, pixelCropOnNatural);
      if (croppedImageBlob) {
        // Let's create a File from the blob
        const file = new File([croppedImageBlob], "cropped-image.png", { type: "image/png" });

        onChange(file);
        setImageToCrop(null); // Close modal
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
    setCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      handleFiles(files);
    },
    [disabled],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (disabled) return;

    // Validate max files
    if (multiple && values.length + files.length > maxFiles) {
      // toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // If single mode, intercept for cropping
    if (!multiple && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          setImageToCrop(reader.result as string);
        });
        reader.readAsDataURL(file);
        return; // Stop here, wait for crop
      }
    }

    setIsUploading(true);
    try {
      const newValues = [...files];

      if (multiple) {
        onChange([...values, ...newValues]);
      } else {
        onChange(newValues[0]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (itemToRemove: string | File) => {
    if (multiple) {
      onChange(values.filter((item) => item !== itemToRemove));
    } else {
      onChange(null);
    }
  };

  // Single Image Mode with existing value
  if (!multiple && values.length > 0) {
    return (
      <>
        <div
          className={cn(
            "relative group overflow-hidden rounded-lg border bg-background",
            className,
          )}
        >
          <ImagePreview
            file={values[0]}
            alt="Upload preview"
            className="w-full h-auto object-contain transition-opacity group-hover:opacity-75"
            style={{ maxHeight: "400px" }}
          />

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <CropIcon className="w-4 h-4 mr-2" />
              Thay thế & Cắt
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleRemove(values[0])}
              disabled={disabled}
            >
              Xóa
            </Button>
          </div>
        </div>
        {/* Crop Modal */}
        <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && handleCropCancel()}>
          <DialogContent className="sm:max-w-[800px] w-full">
            <DialogHeader>
              <DialogTitle>Cắt ảnh (Tùy chỉnh)</DialogTitle>
              <DialogDescription className="hidden">
                Công cụ cắt ảnh trước khi upload
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] w-full bg-black/5 rounded-md p-4 flex justify-center">
              {imageToCrop && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  // Removed aspect to allow free resize
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                >
                  <img
                    loading="lazy"
                    decoding="async"
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop source"
                    onLoad={onImageLoad}
                    style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
                  />
                </ReactCrop>
              )}
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={handleCropCancel}>
                Hủy
              </Button>
              <Button onClick={handleCropConfirm}>Cắt & Lưu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple={false}
          disabled={disabled}
          onChange={handleFileInput}
        />
      </>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
          compact ? "p-4" : "p-8",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileInput}
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2
              className={cn(
                "animate-spin text-muted-foreground",
                compact ? "h-6 w-6" : "h-10 w-10",
              )}
            />
            {!compact && <p className="mt-2 text-sm text-muted-foreground">Processing...</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Upload
              className={cn("text-muted-foreground mb-2", compact ? "h-6 w-6" : "h-10 w-10")}
            />
            {compact ? (
              <p className="text-xs font-medium text-muted-foreground">Upload</p>
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  {multiple
                    ? "Drag & drop images here or click to select"
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Supports: PNG, JPG, JPEG, WEBP</p>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Cắt ảnh (Tùy chỉnh)</DialogTitle>
            <DialogDescription className="hidden">Công cụ cắt ảnh nâng cao</DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 w-full relative bg-black/5 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-4 flex justify-center min-h-full items-center">
                {imageToCrop && (
                  <div
                    className="flex justify-center"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      transition: "transform 0.1s ease-out",
                    }}
                  >
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      style={{ maxWidth: "100%" }}
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        ref={imgRef}
                        src={imageToCrop}
                        alt="Crop source"
                        onLoad={onImageLoad}
                        style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain" }}
                      />
                    </ReactCrop>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="py-4 px-6 bg-background border-t z-10">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-12">Zoom:</span>
              <Slider
                value={[zoom]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
          <DialogFooter className="mr-6 mb-6">
            <Button variant="outline" onClick={handleCropCancel}>
              Hủy
            </Button>
            <Button onClick={handleCropConfirm}>Cắt & Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {multiple && values.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={values.map(getId)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {values.map((item) => (
                <SortableImage
                  key={getId(item)}
                  id={getId(item)}
                  item={item}
                  onRemove={handleRemove}
                  disabled={disabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
