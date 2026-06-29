import React from 'react';
import NewsCard from '../../shared/cards/NewsCard';

export default function NewsListContent() {
  const dummyNews = Array(8).fill({
    id: "1",
    title: "Hướng Dẫn Đăng Nhập Và Tải App Khi Mua Adobe Bản Quyền",
    slug: "huong-dan",
    thumbnail: "",
    excerpt: "Bài viết này sẽ hướng dẫn chi tiết cách để bạn có thể tải và cài đặt phần mềm Adobe sau khi mua bản quyền...",
    date: "19/11/2025"
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 uppercase mb-2">Tin Tức Công Nghệ</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full"></div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyNews.map((n, i) => (
          <NewsCard key={i} {...n} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12 gap-2">
        <button className="px-3 py-1 border rounded hover:bg-gray-50">&lt;</button>
        <button className="px-3 py-1 bg-purple-600 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">&gt;</button>
      </div>
    </div>
  );
}
