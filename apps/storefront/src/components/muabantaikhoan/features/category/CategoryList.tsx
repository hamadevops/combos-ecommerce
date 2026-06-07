"use client";

import React from 'react';
import Link from 'next/link';
import { useCategories } from "@/hooks/useCategories";
import { Loader2 } from "lucide-react";
import { Category } from "@/types/category";
import { getImageUrl } from "@/lib/utils";

export default function MuabanCategoryList() {
  const { data: categories, isLoading } = useCategories();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoryList = Array.isArray(categories) ? categories : (categories as any)?.data || [];

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-purple-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh mục sản phẩm</h1>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-purple-600 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-800">Danh mục sản phẩm</span>
          </div>
        </div>

        {/* Categories Grid */}
        {categoryList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoryList.map((category: Category) => (
              <Link 
                href={`/danh-muc/${category.slug}`} 
                key={category.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="aspect-[4/3] relative bg-gray-100 flex items-center justify-center p-4">
                  <img
                    src={category.image ? getImageUrl(category.image) : "https://placehold.co/400x300/f3f4f6/a8a29e?text=No+Image"}
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center border-t border-gray-50">
                  <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {category.description.replace(/<[^>]*>/g, "")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Chưa có danh mục nào.
          </div>
        )}

      </div>
    </div>
  );
}
