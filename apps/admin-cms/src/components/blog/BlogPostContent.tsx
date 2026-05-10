import { motion } from "framer-motion";
import { Clock, Calendar, ArrowLeft, Tag, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlogPost } from "@/data/mockBlogPosts";
import { getImageUrl, formatMarkdown } from "@/lib/utils";

interface BlogPostContentProps {
  post: BlogPost;
  isPreview?: boolean;
}

export const BlogPostContent = ({ post, isPreview = false }: BlogPostContentProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-2"
    >
      {/* Mobile Table of Contents - Hidden but good to have if we want to support it later, 
                or we can omit it if strictly focusing on desktop preview parity. 
                BlogDetail has it. Let's keep it or make it optional? 
                BlogDetail logic passes TOC sections.
                Let's keep the structure identical to BlogDetail's article.
             */}

      {/* Article Content */}
      <div className="rich-text-content max-w-none">
        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }} />
      </div>

      {/* Tags */}
      <div className="mt-8 border-t pt-8">
        <div className="flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Author Box */}
      <div className="mt-6 rounded-xl border bg-card p-4 sm:mt-8 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <img
            src={post.author.avatar || "https://github.com/shadcn.png"}
            alt={post.author.name}
            className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{post.author.name}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{post.author.bio}</p>
            {!isPreview && (
              <Button variant="outline" size="sm" className="mt-3">
                <User className="mr-2 h-4 w-4" />
                Xem tất cả bài viết
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
