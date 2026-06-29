import React from "react";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";

export interface PolicyProps {
  title?: string;
  content?: string;
  isLoading?: boolean;
}

export default function Policy({ 
  title = "Chính sách mua hàng", 
  content = "<p class='text-center text-gray-500 italic py-10'>Nội dung đang được cập nhật...</p>",
  isLoading = false
}: PolicyProps) {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 lg:p-12 rounded-2xl shadow-sm border-t-4 border-red-600">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8 justify-center">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{title}</span>
        </nav>

        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 uppercase">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>

      </div>
    </div>
  );
}

