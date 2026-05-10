import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Search, Loader2, Edit, Save, Globe } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/common/ImageUpload";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Mock Data Types
interface SeoConfig {
  id: string;
  page_name: string;
  page_link: string;
  title_page: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  canonical_url: string;
  og_image: string;
  index: boolean; // index, follow
  follow: boolean;
}

// Mock Data
const initialSeoData: SeoConfig[] = [
  {
    id: "1",
    page_name: "Trang chủ",
    page_link: "/",
    title_page: "Hukan Shop - Trang chủ",
    meta_title: "Hukan Shop - Mua sắm trực tuyến hàng đầu",
    meta_description:
      "Chào mừng đến với Hukan Shop, nơi cung cấp các sản phẩm chất lượng cao với giá tốt nhất.",
    keywords: "hukan, shop, e-commerce, mua sắm",
    canonical_url: "https://hukanshop.com/",
    og_image: "",
    index: true,
    follow: true,
  },
  {
    id: "2",
    page_name: "Danh sách sản phẩm",
    page_link: "/products",
    title_page: "Sản phẩm - Hukan Shop",
    meta_title: "Tất cả sản phẩm | Hukan Shop",
    meta_description: "Khám phá danh mục sản phẩm đa dạng của chúng tôi.",
    keywords: "sản phẩm, mua hàng, online",
    canonical_url: "https://hukanshop.com/products",
    og_image: "",
    index: true,
    follow: true,
  },
  {
    id: "3",
    page_name: "Bài viết / Tin tức",
    page_link: "/blog",
    title_page: "Tin tức - Hukan Shop",
    meta_title: "Tin tức & Bài viết mới nhất",
    meta_description: "Cập nhật những tin tức mới nhất về sản phẩm và khuyến mãi.",
    keywords: "tin tức, blog, bài viết",
    canonical_url: "https://hukanshop.com/blog",
    og_image: "",
    index: true,
    follow: true,
  },
  {
    id: "4",
    page_name: "Liên hệ",
    page_link: "/contact",
    title_page: "Liên hệ - Hukan Shop",
    meta_title: "Liên hệ với chúng tôi",
    meta_description: "Thông tin liên hệ, địa chỉ và số điện thoại của Hukan Shop.",
    keywords: "liên hệ, hỗ trợ, address",
    canonical_url: "https://hukanshop.com/contact",
    og_image: "",
    index: true,
    follow: true,
  },
];

// Form Schema
const seoFormSchema = z.object({
  title_page: z.string().min(1, "Tiêu đề trang là bắt buộc"),
  meta_title: z.string().min(1, "Meta Title là bắt buộc"),
  meta_description: z.string().max(320, "Meta Description không nên quá 320 ký tự"),
  keywords: z.string(),
  canonical_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  og_image: z.any().optional(), // Can be string or File
  index: z.boolean().default(true),
  follow: z.boolean().default(true),
});

type SeoFormValues = z.infer<typeof seoFormSchema>;

export default function SeoManagement() {
  const [data, setData] = useState<SeoConfig[]>(initialSeoData);
  const [editingItem, setEditingItem] = useState<SeoConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title_page: "",
      meta_title: "",
      meta_description: "",
      keywords: "",
      canonical_url: "",
      og_image: "",
      index: true,
      follow: true,
    },
  });

  const handleEdit = (item: SeoConfig) => {
    setEditingItem(item);
    form.reset({
      title_page: item.title_page,
      meta_title: item.meta_title,
      meta_description: item.meta_description,
      keywords: item.keywords,
      canonical_url: item.canonical_url,
      og_image: item.og_image,
      index: item.index,
      follow: item.follow,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: SeoFormValues) => {
    if (!editingItem) return;

    // Simulate API update
    const updatedData = data.map((item) =>
      item.id === editingItem.id
        ? { ...item, ...values, og_image: values.og_image || item.og_image } // Handle image simply for mock
        : item,
    );

    setData(updatedData);
    setIsDialogOpen(false);
    toast({
      title: "Thành công",
      description: "Đã cập nhật cấu hình SEO",
    });
  };

  return (
    <AdminLayout title="Quản lý SEO">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cấu hình SEO</h2>
            <p className="text-muted-foreground">Quản lý meta tag và SEO cho các trang tĩnh</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách trang</CardTitle>
              <CardDescription>
                Quản lý thẻ meta, tiêu đề và hình ảnh chia sẻ mạng xã hội
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Trang</TableHead>
                    <TableHead>Đường dẫn</TableHead>
                    <TableHead>Meta Title</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.page_name}</span>
                          <span className="text-xs text-muted-foreground">{item.title_page}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={item.page_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          {item.page_link} <Globe className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{item.meta_title}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.index ? (
                            <Badge variant="default">Index</Badge>
                          ) : (
                            <Badge variant="secondary">Noindex</Badge>
                          )}
                          {item.follow ? (
                            <Badge variant="outline">Follow</Badge>
                          ) : (
                            <Badge variant="secondary">Nofollow</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cấu hình SEO: {editingItem?.page_name}</DialogTitle>
              <DialogDescription>Chỉnh sửa thông tin SEO cho trang này.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title_page"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề Trang (H1/Title)</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tiêu đề trang..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canonical_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canonical URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập meta title..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Tiêu đề hiển thị trên kết quả tìm kiếm Google (50-60 ký tự).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập mô tả..." className="resize-none" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mô tả ngắn gọn nội dung trang (150-160 ký tự).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords</FormLabel>
                      <FormControl>
                        <Input placeholder="Từ khóa 1, từ khóa 2..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Các từ khóa liên quan, phân cách bằng dấu phẩy.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="index"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Index</FormLabel>
                          <FormDescription>Cho phép Google lập chỉ mục</FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="follow"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Follow</FormLabel>
                          <FormDescription>Cho phép Google theo dõi liên kết</FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="og_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OG Image (Ảnh chia sẻ MXH)</FormLabel>
                      <FormControl>
                        <ImageUpload value={field.value} onChange={field.onChange} maxFiles={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Lưu thay đổi</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
