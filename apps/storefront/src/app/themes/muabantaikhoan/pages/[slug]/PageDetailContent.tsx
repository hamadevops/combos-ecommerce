"use client";

import React from "react";
import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import { usePage } from "@/hooks/usePages";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PageDetailContentProps {
  slug: string;
}

export default function PageDetailContent({ slug }: PageDetailContentProps) {
  const { data: page, isLoading, isError } = usePage(slug);
  const router = useRouter();

  if (isError || (!isLoading && !page)) {
    return (
      <DeviceLayoutWrapper>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 py-20 px-4">
          <h2 className="text-xl font-bold text-gray-900">Trang không tồn tại</h2>
          <p className="text-gray-600 text-center">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </DeviceLayoutWrapper>
    );
  }

  return (
    <DeviceLayoutWrapper>
      <div className="bg-white min-h-[50vh] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Centered Page Title */}
          <h1 className="text-center text-3xl font-bold text-gray-900 my-8">
            {page?.title || "Nội dung trang"}
          </h1>

          {/* Left-aligned content */}
          <div className="prose max-w-none text-gray-800 leading-relaxed mt-10">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: page?.content || "" }} />
            )}
          </div>

        </div>
      </div>
    </DeviceLayoutWrapper>
  );
}

