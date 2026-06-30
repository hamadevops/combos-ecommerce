"use client";

import DeviceLayoutWrapper from "@/components/muabantaikhoan/layout/DeviceLayoutWrapper";
import {
  ChevronRight,
  Heart,
  MapPin,
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  Star,
  Gift,
  Ticket,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { icon: Heart, label: "Sản phẩm yêu thích", count: 12 },
  { icon: MapPin, label: "Địa chỉ nhận hàng" },
  { icon: CreditCard, label: "Phương thức thanh toán" },
  { icon: Gift, label: "Ưu đãi của tôi", count: 5 },
  { icon: Ticket, label: "Voucher", count: 3 },
  { icon: Star, label: "Đánh giá của tôi" },
  { icon: HelpCircle, label: "Trung tâm hỗ trợ" },
  { icon: Settings, label: "Cài đặt" },
];

const Profile = () => {
  return (
    <DeviceLayoutWrapper>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-purple-600 transition-colors">Trang chủ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Tài khoản</span>
          </nav>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: User Info Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-3xl mb-4 text-purple-600">
                  👤
                </div>
                <h2 className="text-lg font-bold text-gray-900">Người dùng</h2>
                <p className="text-sm text-gray-500 mt-0.5">+84 xxx xxx xxx</p>
                <div className="border-t border-gray-100 w-full mt-6 pt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-extrabold text-red-600">12</p>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Đơn hàng</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-red-600">1.2k</p>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider font-mono">Xu tích lũy</p>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-colors border border-red-100">
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>

            {/* Right: Menu Items */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:text-purple-600 group-hover:bg-purple-50 transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 font-bold text-gray-700 text-sm md:text-base group-hover:text-gray-900">
                      {item.label}
                    </span>
                    {item.count && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-100">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeviceLayoutWrapper>
  );
};

export default Profile;
