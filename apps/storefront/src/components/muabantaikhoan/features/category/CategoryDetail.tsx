import React from 'react';
import Link from 'next/link';
import ProductCard from '../../shared/cards/ProductCard';
import { getImageUrl } from '@/lib/utils';

interface MuabanCategoryDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
  isLoading: boolean;
  totalProducts: number;
}

export default function MuabanCategoryDetail({
  category,
  products,
  isLoading,
  totalProducts,
}: MuabanCategoryDetailProps) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{category.name}</h1>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Link href="/" className="hover:text-purple-600 transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="font-semibold text-gray-800">{category.name}</span>
            </div>
          </div>
          
          {/* Sorting / Toolbar */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Showing all {totalProducts} results</span>
            <select className="border border-gray-300 bg-white rounded px-3 py-1.5 focus:outline-none focus:border-purple-500">
              <option value="newest">Sắp xếp theo mới nhất</option>
              <option value="price_asc">Giá từ thấp đến cao</option>
              <option value="price_desc">Giá từ cao đến thấp</option>
              <option value="bestseller">Bán chạy nhất</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                thumbnail={getImageUrl(product.thumbnail || product.image) || ""}
                currentPrice={product.price || 0}
                originalPrice={product.original_price}
                discountPercent={product.discount_percent}
                tags={product.tags}
                isVip={product.is_vip}
                soldCount={product.sold_count || 0}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
            Không có sản phẩm nào trong danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
