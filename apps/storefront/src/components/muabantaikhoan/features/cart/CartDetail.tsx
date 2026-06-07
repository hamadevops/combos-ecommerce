import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Minus, Plus } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface CartDetailProps {
  items: CartItem[];
  onUpdateQuantity?: (id: string, newQuantity: number) => void;
  onRemove?: (id: string) => void;
}

export default function CartDetail({ items: initialItems, onUpdateQuantity, onRemove }: CartDetailProps) {
  // Local state for dummy data if no handlers provided
  const [localItems, setLocalItems] = useState<CartItem[]>(initialItems);

  // Sync local items if initialItems changes
  useEffect(() => {
    setLocalItems(initialItems);
  }, [initialItems]);

  // If handlers are provided, we use initialItems (from props) directly.
  // Otherwise, we use localItems.
  const activeItems = onUpdateQuantity && onRemove ? initialItems : localItems;

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(id, newQuantity);
    } else {
      setLocalItems(localItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleRemove = (id: string) => {
    if (onRemove) {
      onRemove(id);
    } else {
      setLocalItems(localItems.filter(item => item.id !== id));
    }
  };

  const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Giỏ hàng</span>
        </nav>

        {activeItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống</h2>
            <Link href="/danh-muc" className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Left: Cart Items (60%) */}
            <div className="lg:w-[60%]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="pb-4 font-bold text-gray-900 uppercase w-10"></th>
                      <th className="pb-4 font-bold text-gray-900 uppercase w-20"></th>
                      <th className="pb-4 font-bold text-gray-900 uppercase">Sản phẩm</th>
                      <th className="pb-4 font-bold text-gray-900 uppercase">Giá</th>
                      <th className="pb-4 font-bold text-gray-900 uppercase text-center">Số lượng</th>
                      <th className="pb-4 font-bold text-gray-900 uppercase text-right">Tạm tính</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        {/* Remove button */}
                        <td className="py-6">
                          <button 
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                        {/* Thumbnail */}
                        <td className="py-6">
                          <div className="w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-white p-1">
                            <img src={item.thumbnail} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                        </td>
                        {/* Name */}
                        <td className="py-6 text-primary font-semibold pr-4">
                          {item.name}
                        </td>
                        {/* Price */}
                        <td className="py-6 text-gray-800 font-bold whitespace-nowrap">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </td>
                        {/* Quantity */}
                        <td className="py-6">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center border border-gray-300 rounded-full bg-white px-2 py-1 w-24">
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                className="text-gray-500 hover:text-red-600 p-1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="flex-1 text-center text-sm font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="text-gray-500 hover:text-green-600 p-1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                        {/* Subtotal */}
                        <td className="py-6 text-gray-900 font-bold text-right whitespace-nowrap">
                          {(item.price * item.quantity).toLocaleString("vi-VN")} ₫
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Actions below table */}
              <div className="mt-6 flex justify-between items-center">
                <Link href="/" className="inline-block border-2 border-red-600 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-60 transition-colors uppercase text-sm hover:bg-red-50">
                  ← Tiếp tục xem sản phẩm
                </Link>
              </div>
            </div>

            {/* Right: Order Summary (40%) */}
            <div className="lg:w-[40%]">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase border-b border-gray-200 pb-4">
                  Tổng cộng giỏ hàng
                </h2>
                
                <div className="flex justify-between items-center py-4 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Tạm tính</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString("vi-VN")} ₫</span>
                </div>
                
                <div className="flex justify-between items-center py-6 border-b border-gray-200 mb-6">
                  <span className="text-gray-900 font-bold uppercase">Tổng</span>
                  <span className="font-bold text-red-600 text-2xl">{subtotal.toLocaleString("vi-VN")} ₫</span>
                </div>

                {/* Coupon */}
                <div className="mb-6 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mã ưu đãi" 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                  />
                  <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors whitespace-nowrap">
                    Áp dụng
                  </button>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full block text-center bg-red-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-red-700 transition-colors uppercase text-lg tracking-wide shadow-md shadow-red-600/20"
                >
                  Tiến hành thanh toán
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
