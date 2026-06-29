import React from 'react';
import { ShoppingCart, Check, ShieldCheck, Gift } from 'lucide-react';

export default function ProductDetailContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Placeholder */}
      <div className="text-sm text-gray-500 mb-6">Trang chủ / Phần mềm / Tên sản phẩm</div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Gallery */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-100 rounded-lg pt-[100%] relative overflow-hidden mb-4">
            <img 
              src="https://placehold.co/600x600/f3f4f6/a8a29e?text=Product+Image" 
              alt="Product" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
             {[1,2,3,4].map(i => (
               <div key={i} className="bg-gray-100 rounded pt-[100%] relative cursor-pointer border-2 border-transparent hover:border-purple-500"></div>
             ))}
          </div>
        </div>

        {/* Center: Info */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Nâng Cấp Autodesk Bản Quyền Giá Rẻ</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-500 line-through">120,000đ</span>
            <span className="text-3xl font-bold text-red-600">115,000đ</span>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-600">
            <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5" /> Bảo hành trong toàn bộ thời gian của gói đăng ký.</li>
            <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5" /> Nâng cấp chính chủ cần cung cấp số điện thoại đăng nhập.</li>
            <li className="flex items-start gap-2"><Check size={16} className="text-green-500 mt-0.5" /> Liên hệ tổng đài tư vấn miễn phí TẠI ĐÂY.</li>
          </ul>

          <div className="mb-4 flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">Tình trạng:</span>
            <span className="text-green-600 font-bold">Còn Hàng</span>
          </div>

          <div className="mb-6 flex items-center gap-4 text-sm">
            <span className="font-semibold text-gray-700">Số lượng:</span>
            <div className="flex border rounded w-24">
              <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100">-</button>
              <input type="text" value="1" readOnly className="w-full text-center outline-none" />
              <button className="px-3 py-1 bg-gray-50 hover:bg-gray-100">+</button>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={20} /> Thêm vào giỏ
            </button>
            <button className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded flex flex-col items-center justify-center transition-colors">
              <span>Mua ngay</span>
              <span className="text-[10px] font-normal">Thời gian hoàn tất từ 1-10 phút</span>
            </button>
          </div>
        </div>

        {/* Right: Sidebars */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Promo Box */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-red-600 text-white font-bold text-center py-2 uppercase">Khuyến mãi đặc biệt</div>
            <div className="p-4 text-sm space-y-3 bg-red-50/30 text-gray-700">
              <p>- <strong>Nâng cấp chính chủ</strong>, tặng kèm 2TB dung lượng lưu trữ.</p>
              <p>- Giảm trực tiếp 10%, tối đa <strong>200.000 VNĐ</strong> khi thanh toán từ 1 triệu đồng.</p>
              <p>- <strong>Bảo hành 1-1</strong>: Trong toàn bộ thời gian của gói.</p>
              <p>- Tặng youtube premium 4 tháng tạo sẵn với hóa đơn trên 1.000.000 đ.</p>
            </div>
          </div>

          {/* Policy Box */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-black text-white font-bold text-center py-2 uppercase">Chính sách SHOPACCONLINE</div>
            <div className="p-4 text-sm space-y-4">
              <div className="flex gap-3">
                <ShieldCheck size={24} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Miễn phí</div>
                  <div className="text-gray-500">Trải nghiệm một số sản phẩm</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Gift size={24} className="text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-bold">Quà tặng</div>
                  <div className="text-gray-500">Với hóa đơn trên 1 triệu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-xl font-bold uppercase border-b pb-2 mb-4">Thông tin sản phẩm</h2>
        <div className="prose max-w-none text-gray-700">
          <p>LinkedIn là mạng xã hội việc làm chuyên nghiệp hàng đầu thế giới...</p>
          {/* More content */}
        </div>
      </div>
    </div>
  );
}
