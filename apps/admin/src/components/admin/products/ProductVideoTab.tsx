import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { productApi } from "@/api/product";
import { Loader2, Upload, Video, X, UploadCloud, Trash2, Eye, EyeOff } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProductVideoTabProps {
  productId: number;
  videos?: Array<{ id: number; videoUrl: string; thumbnailUrl?: string; isVisible: number }>;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export function ProductVideoTab({ productId, videos = [] }: ProductVideoTabProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      } else {
        toast.error("Vui lòng chỉ chọn file video.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const clearFile = () => {
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    setStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Vui lòng chọn video để tải lên");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setStatus("Chuẩn bị chia nhỏ file...");

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(7);
    const originalname = file.name;

    setStatus(`Server đang xử lý ${totalChunks} phần...`);

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const chunkFile = new File([chunk], originalname, { type: file.type });

        const currentPercent = Math.round((chunkIndex / totalChunks) * 100);
        setStatus(`Đang tải lên... ${currentPercent}%`);

        await productApi.addVideo(productId, {
          file: chunkFile,
          chunkIndex,
          totalChunks,
          uploadId,
          originalname,
          isVisible: isVisible ? 1 : 0
        });

        const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setProgress(percent);
        if (chunkIndex + 1 < totalChunks) {
          setStatus(`Đang tải lên... ${percent}%`);
        }
      }

      setStatus("✅ Quá trình tải lên đã hoàn tất thành công!");
      toast.success("Tải lên video thành công!");

      clearFile();
      queryClient.invalidateQueries({ queryKey: ["product", productId] });

    } catch (error: any) {
      console.error(error);
      setStatus(`❌ Thất bại: ${error?.message || 'Lỗi kết nối tới máy chủ'}`);
      toast.error("Quá trình tải lên bị lỗi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleVisibility = async (videoId: number, currentVisibility: number) => {
    try {
      const newVisibility = currentVisibility ? 0 : 1;
      await productApi.updateVideoVisibility(productId, videoId, newVisibility);
      toast.success("Cập nhật trạng thái hiển thị thành công!");
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch (error: any) {
      toast.error("Lỗi khi cập nhật trạng thái hiển thị.");
    }
  };

  const confirmDelete = async () => {
    if (!videoToDelete) return;
    try {
      await productApi.deleteVideo(productId, videoToDelete);
      toast.success("Đã xóa video thành công!");
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    } catch (error: any) {
      toast.error("Lỗi khi xóa video.");
    } finally {
      setVideoToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="space-y-4">

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors p-8",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              type="file"
              accept="video/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <div className="flex flex-col items-center text-center">
              <Upload className="text-muted-foreground mb-2 h-10 w-10" />
              <p className="text-sm font-medium text-muted-foreground">
                Kéo thả video vào đây hoặc click để tải lên
              </p>
              <p className="text-xs text-muted-foreground mt-1">Hỗ trợ các file lớn (&gt; 500MB)</p>
            </div>
          </div>
        ) : (
          <div className="relative group overflow-hidden rounded-lg border bg-background p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="p-2 bg-muted text-muted-foreground rounded-lg shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                disabled={isUploading}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden bg-black aspect-[9/16] mb-4 w-full max-w-[180px] flex self-center items-center justify-center border border-border">
                <video
                  src={previewUrl}
                  controls
                  className="max-w-full max-h-full"
                />
              </div>
            )}

            <div className="flex items-center space-x-3 mb-6">
              <Switch id="upload-visibility" checked={isVisible} onCheckedChange={setIsVisible} disabled={isUploading} />
              <Label htmlFor="upload-visibility" className="cursor-pointer text-sm font-medium text-foreground">
                {isVisible ? "Cho phép hiển thị video này sau khi tải lên" : "Tạm ẩn video này sau khi tải lên"}
              </Label>
            </div>

            {(isUploading || status !== "") && (
              <div className="mb-4 space-y-2 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-muted-foreground">Tiến trình</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-xs text-center text-muted-foreground mt-2">{status}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-auto pt-4 border-t border-border">
              {progress === 0 && !isUploading && (
                <Button variant="outline" onClick={clearFile} disabled={isUploading}>
                  Hủy bỏ
                </Button>
              )}
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                {isUploading ? "Đang xử lý..." : "Xác nhận tải lên"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {videos && videos.length > 0 && (
        <div className="border-t pt-8 space-y-4">
          <h3 className="text-lg font-medium text-foreground">Video hiện tại ({videos.length})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative group overflow-hidden rounded-lg border bg-background flex flex-col">
                <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/80 hover:bg-white text-slate-700 shadow-sm"
                    onClick={() => handleToggleVisibility(video.id, video.isVisible)}
                    title={video.isVisible ? "Đang hiển thị - Click để ẩn" : "Đang ẩn - Click để hiển thị"}
                  >
                    {video.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 shadow-sm"
                    onClick={() => setVideoToDelete(video.id)}
                    title="Xóa video"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative bg-black aspect-[9/16] flex items-center justify-center w-full">
                  <video
                    src={getImageUrl(video.videoUrl)}
                    controls
                    preload="metadata"
                    className={cn("max-w-full max-h-full", !video.isVisible && "opacity-50 grayscale")}
                  />
                  {!video.isVisible && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">Đã ẩn</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!videoToDelete} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa video</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa video này không? Hành động này không thể hoàn tác và video sẽ bị xoá vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Xóa video
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
