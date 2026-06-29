import { useEffect, useState } from "react";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { BlogPost, getLatestPosts } from "@/data/mockBlogPosts";
import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Bookmark,
  ChevronUp,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/utils";
import { usePost } from "@/hooks/usePosts";

const BlogPreview = () => {
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Mock latest posts for right sidebar
  const latestPosts = getLatestPosts("preview-slug");

  const { id } = useParams();
  const { data: postResponse, isLoading: isLoadingPost } = usePost(id ? Number(id) : undefined);

  useEffect(() => {
    // If ID is present, we rely on usePost hook
    if (id) {
      if (postResponse?.data) {
        const post = postResponse.data;
        const constructedPost: BlogPost = {
          id: String(post.id),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || "",
          content: post.content || "",
          image: post.thumbnail || "",
          date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
            : new Date().toLocaleDateString("vi-VN"),
          readTime: "5 min read", // consistent mock
          author: {
            name: post.author?.name || "Admin",
            avatar: post.author?.avatar
              ? getImageUrl(post.author.avatar)
              : "https://github.com/shadcn.png",
            bio: "Admin User",
          },
          category: post.topics && post.topics.length > 0 ? post.topics[0].name : "Uncategorized",
          tags: post.tags?.map((t: any) => t.name) || [],
          tableOfContents: [],
        };
        setPreviewPost(constructedPost);
      }
      return;
    }

    // Fallback to localStorage for Draft Preview (from AdminBlogForm)
    const storedData = localStorage.getItem("preview_post_data");
    if (storedData) {
      try {
        const formData = JSON.parse(storedData);
        const constructedPost: BlogPost = {
          id: "9999",
          title: formData.title || "Untitled Post",
          slug: formData.slug || "untitled",
          excerpt: formData.excerpt || "",
          content: formData.content || "",
          image: formData.thumbnail || "",
          date: new Date().toLocaleDateString("vi-VN"),
          readTime: "5 min read",
          author: {
            name: "Admin",
            avatar: "https://github.com/shadcn.png",
            bio: "Admin User",
          },
          category: "Preview Category",
          tags: [],
          tableOfContents: [],
        };

        setPreviewPost(constructedPost);
      } catch (e) {
        console.error("Failed to parse preview data", e);
      }
    }
  }, [id, postResponse]);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if ((id && isLoadingPost) || (!previewPost && id && !postResponse?.data)) {
    return <div className="p-10 text-center">Loading preview...</div>;
  }

  if (!previewPost) {
    return <div className="p-10 text-center">No preview data found.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden sm:h-[50vh] sm:min-h-[400px] lg:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(previewPost.image)}
            alt={previewPost.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="container-custom relative z-10 flex h-full flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="mb-3 inline-flex items-center gap-2 text-xs text-yellow-500 font-bold sm:mb-4 sm:text-sm border border-yellow-500 px-2 py-1 rounded bg-yellow-500/10">
              CHẾ ĐỘ XEM TRƯỚC (PREVIEW MODE)
            </div>

            <div className="block">
              <Badge className="mb-3 bg-accent text-accent-foreground sm:mb-4">
                {previewPost.category}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">
              {previewPost.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:mt-6 sm:gap-4 sm:text-sm">
              <div className="flex items-center gap-2">
                <img
                  src={previewPost.author.avatar || "https://github.com/shadcn.png"}
                  alt={previewPost.author.name}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-background sm:h-10 sm:w-10"
                />
                <span className="font-medium text-foreground">{previewPost.author.name}</span>
              </div>
              <Separator orientation="vertical" className="hidden h-5 sm:block" />
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {previewPost.date}
              </span>
              <Separator orientation="vertical" className="hidden h-5 sm:block" />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                {previewPost.readTime}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border bg-card p-4 sm:p-6 opacity-60">
                {/* Mock TOC for preview intentionally or could be empty */}
                <h3 className="mb-4 font-semibold">Mục lục</h3>
                <p className="text-sm text-muted-foreground italic">
                  Mục lục sẽ được tạo tự động khi đăng bài.
                </p>
              </div>

              {/* Share buttons */}
              <div className="rounded-xl border bg-card p-4 sm:p-6">
                <h3 className="mb-4 font-semibold">Chia sẻ bài viết</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="flex-1">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="flex-1">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content using Reusable Component */}
          <BlogPostContent post={previewPost} isPreview={true} />

          {/* Right Sidebar - Latest Posts */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-first space-y-6 lg:order-last"
          >
            <div className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="mb-4 font-semibold">Bài viết mới nhất</h3>
              <div className="space-y-4">
                {latestPosts.map((latestPost) => (
                  <Link
                    key={latestPost.id}
                    to={`/blog/${latestPost.slug}`}
                    target="_blank" // Preview mode links should ideally open new tabs or be disabled
                    className="group flex gap-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={latestPost.image}
                        alt={latestPost.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-accent">
                        {latestPost.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">{latestPost.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="rounded-xl bg-accent/10 p-4 sm:p-6">
              <h3 className="font-semibold">Đăng ký nhận bài viết mới</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nhận thông báo khi có bài viết mới về thời trang và phong cách.
              </p>
              <Button className="mt-4 w-full">Đăng ký ngay</Button>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Scroll to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-accent p-2.5 text-accent-foreground shadow-lg transition-colors hover:bg-accent/90 sm:bottom-8 sm:right-8 sm:p-3"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
};

export default BlogPreview;
