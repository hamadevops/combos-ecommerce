import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { CartItem } from "../cart/CartDetail";

export interface CheckoutDetailProps {
  items: CartItem[];
}

export default function CheckoutDetail({ items }: CheckoutDetailProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Thanh toán</span>
        </nav>

        {/* Notice */}
        <div className="bg-white border-t-4 border-red-600 p-4 rounded-lg shadow-sm mb-8 text-sm text-gray-700 flex items-center">
          Bạn có mã giảm giá? <button className="text-red-600 ml-1 hover:underline focus:outline-none">Ấn vào đây để nhập mã</button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Billing Form (58%) */}
          <div className="lg:w-7/12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase border-b border-gray-200 pb-4">
              Thông tin thanh toán
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Số điện thoại *</label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ email *</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-10 mb-6 uppercase border-b border-gray-200 pb-4">
              Thông tin bổ sung
            </h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú đơn hàng (tuỳ chọn)</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
              ></textarea>
            </div>
          </div>

          {/* Right: Order Summary (42%) */}
          <div className="lg:w-5/12">
            <div className="bg-white border-2 border-red-600 rounded-xl p-6 lg:p-8 shadow-lg shadow-red-600/5 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase text-center">
                Đơn hàng của bạn
              </h2>

              {/* Order Items Table */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-sm font-bold text-gray-600 uppercase mb-4">
                  <span>Sản phẩm</span>
                  <span>Tạm tính</span>
                </div>
                
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="text-gray-600 pr-4">
                        {item.name} <strong className="text-gray-900">× {item.quantity}</strong>
                      </div>
                      <div className="text-gray-900 font-bold whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-6">
                <span className="text-gray-900 font-bold uppercase">Tổng</span>
                <span className="font-bold text-red-600 text-2xl">{subtotal.toLocaleString("vi-VN")} ₫</span>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8">
                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="radio" name="payment_method" className="w-5 h-5 accent-red-600 cursor-pointer" defaultChecked />
                    </div>
                    <span className="font-bold text-gray-900">Chuyển khoản ngân hàng</span>
                  </label>
                  <div className="mt-3 text-sm text-gray-600 pl-8 relative">
                    <div className="absolute top-[-8px] left-8 w-3 h-3 bg-gray-50 border-t border-l border-gray-200 transform rotate-45"></div>
                    <div className="bg-white border border-gray-200 p-3 rounded-md text-xs leading-relaxed">
                      Thực hiện thanh toán vào ngay tài khoản ngân hàng của chúng tôi. Đơn hàng sẽ được xử lý ngay sau khi tiền đã chuyển.
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="radio" name="payment_method" className="w-5 h-5 accent-red-600 cursor-pointer" />
                    </div>
                    <span className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-6 leading-relaxed text-center">
                Thông tin cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng, tăng trải nghiệm sử dụng website, và cho các mục đích cụ thể khác đã được mô tả trong <Link href="/pages/chinh-sach-bao-mat" className="text-red-600 hover:underline">chính sách bảo mật</Link> của chúng tôi.
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors uppercase text-lg tracking-wide shadow-md shadow-red-600/20"
              >
                <Lock className="w-5 h-5" />
                Đặt hàng
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
