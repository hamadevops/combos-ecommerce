import React from 'react';
import ProductCard from '../../shared/cards/ProductCard';

export default function CategoryContent() {
  const dummyProducts = Array(12).fill({
    id: "1",
    name: "Tài khoản Canva Pro Vĩnh Viễn",
    slug: "canva-pro",
    thumbnail: "",
    originalPrice: 100000,
    currentPrice: 70000,
    discountPercent: 30,
    tags: ["Vĩnh Viễn"],
    isVip: true
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Banner */}
      <div className="bg-purple-100 rounded-xl p-8 text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800 uppercase mb-2">Phần Mềm Làm Việc</h1>
        <p className="text-purple-600">Nâng cao hiệu suất công việc với các phần mềm bản quyền giá rẻ.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white border rounded-lg p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Danh mục</h3>
            <ul className="space-y-2 text-gray-600 text-sm mb-6">
              <li className="text-purple-600 font-semibold cursor-pointer">Phần Mềm Làm Việc (12)</li>
              <li className="hover:text-purple-600 cursor-pointer">Giải trí (8)</li>
              <li className="hover:text-purple-600 cursor-pointer">Học tập (15)</li>
            </ul>

            <h3 className="font-bold text-lg mb-4 border-b pb-2">Mức giá</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Dưới 50.000đ</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> 50.000đ - 100.000đ</label></li>
              <li><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" /> Trên 100.000đ</label></li>
            </ul>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">Hiển thị 1-12 của 36 sản phẩm</div>
            <select 
              aria-label="Sắp xếp sản phẩm"
              title="Sắp xếp sản phẩm"
              className="border rounded px-3 py-1 text-sm outline-none"
            >
              <option>Mới nhất</option>
              <option>Giá: Thấp đến Cao</option>
              <option>Giá: Cao đến Thấp</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {dummyProducts.map((p, i) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50">&lt;</button>
            <button className="px-3 py-1 bg-purple-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
