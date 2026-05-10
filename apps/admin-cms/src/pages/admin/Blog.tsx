import { useState } from "react";

import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Image, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { getImageUrl, formatDate } from "@/lib/utils";
import { useTopics } from "@/hooks/useTopics";
import { useUsers } from "@/hooks/useUsers";
import { BlogFilters, BlogActiveBadges } from "@/components/admin/blog/BlogFilters";
import { PostsFindAllData } from "@vibe/shared";

// const blogCategories = ['Xu hướng', 'Phong cách', 'Hướng dẫn', 'Mẹo hay', 'Street Style', 'Phụ kiện'];

const AdminBlog = () => {
  const [filterParams, setFilterParams] = useState<PostsFindAllData["query"]>({});
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data for filters
  // Data for filters
  const { data: topicsData } = useTopics();
  const { data: usersData } = useUsers({ limit: 100 }); // Fetch enough users for dropdown

  // Safely extract topics
  const topics = Array.isArray(topicsData?.data)
    ? topicsData.data
    : (topicsData as any)?.data?.data && Array.isArray((topicsData as any).data.data)
      ? (topicsData as any).data.data
      : [];

  // Safely extract users
  const users = Array.isArray(usersData?.data)
    ? usersData.data
    : (usersData as any)?.data?.data && Array.isArray((usersData as any).data.data)
      ? (usersData as any).data.data
      : [];

  // Helper to flatten topics for dropdown
  const flattenTopics = (topics: any[], level = 0, result: any[] = []) => {
    topics.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenTopics(cat.children, level + 1, result);
      }
    });
    return result;
  };
  const topicOptions = flattenTopics(topics);

  // Query
  const { data: postsData, isLoading } = usePosts({
    ...filterParams,
    page,
    limit,
  });

  const deletePost = useDeletePost();

  const posts = postsData?.data || [];
  const meta = postsData?.meta;

  const handleDelete = (id: number) => {
    deletePost.mutate(id);
  };

  return (
    <AdminLayout title="Quản lý bài viết">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách bài viết ({meta?.total || 0})</CardTitle>
          <Button asChild>
            <Link to="/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài viết
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-2">
            <BlogFilters 
              value={filterParams} 
              onFilterChange={(newFilters) => {
                setFilterParams(newFilters);
                setPage(1);
              }} 
            />
            <BlogActiveBadges 
              filters={filterParams} 
              onFilterChange={(newFilters) => {
                setFilterParams(newFilters);
                setPage(1);
              }} 
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hình</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày đăng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Chưa có bài viết nào
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-secondary">
                          {post.thumbnail ? (
                            <img
                              src={getImageUrl(post.thumbnail)}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Image className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-medium truncate" title={post.title}>
                            {post.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.topics?.map((topic) => (
                            <Badge key={topic.id} variant="secondary" className="text-xs">
                              {topic.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Author avatar not always available in basic User entity unless populated specific way */}
                          <span className="text-sm">{post.author?.name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.isPublished ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Public</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(post.publishedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/blog/preview/${post.id}`} target="_blank">
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/blog/edit/${post.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <ConfirmDialog
                            trigger={
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            }
                            title="Xóa bài viết?"
                            description={`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`}
                            onConfirm={() => handleDelete(post.id)}
                          />
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminBlog;
