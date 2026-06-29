import React from 'react';
import { Calendar, User } from 'lucide-react';
import NewsCard from '../../shared/cards/NewsCard';

export default function ArticleContent() {
  const dummyRelated = Array(4).fill({
    id: "1",
    title: "Cách đăng nhập CAPCUT PRO trên điện thoại",
    slug: "capcut-pro",
    thumbnail: "",
    excerpt: "Hướng dẫn nhanh...",
    date: "15/10/2025"
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">Trang chủ / Tin tức công nghệ / Tên bài viết</div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Article */}
        <div className="w-full lg:w-3/4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Hướng Dẫn Đăng Nhập Và Tải App Khi Mua Adobe Bản Quyền
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-4">
            <span className="flex items-center gap-1"><Calendar size={16}/> 19/11/2025</span>
            <span className="flex items-center gap-1"><User size={16}/> Admin</span>
          </div>

          <div className="prose max-w-none text-gray-700">
            <p>Welcome to WordPress. This is your first post. Edit or delete it, then start blogging!</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sed vulputate massa. Fusce ante magna, iaculis ut purus ut, facilisis volutpat velit.</p>
            {/* Dummy image */}
            <div className="my-6 bg-gray-100 pt-[50%] relative rounded-lg">
               <span className="absolute inset-0 flex items-center justify-center text-gray-400">Hình ảnh minh họa</span>
            </div>
            <p>Curabitur euismod mi sed nisl vulputate, ac dictum lectus tempus. Mauris in feugiat urna, at suscipit nulla.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-gray-50 border rounded-lg p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4 border-b pb-2 uppercase">Bài viết nổi bật</h3>
            <ul className="space-y-4">
              {[1,2,3].map(i => (
                <li key={i} className="flex gap-3 group cursor-pointer">
                  <div className="w-20 h-16 bg-gray-200 flex-shrink-0 rounded overflow-hidden"></div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      OpenAI Phát Hành Mô Hình AI Mới Mang Tên GPT-4o
                    </h4>
                    <span className="text-xs text-gray-500">10/05/2025</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related News */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold uppercase mb-6">Bài viết liên quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyRelated.map((n, i) => (
            <NewsCard key={i} {...n} />
          ))}
        </div>
      </div>
    </div>
  );
}
