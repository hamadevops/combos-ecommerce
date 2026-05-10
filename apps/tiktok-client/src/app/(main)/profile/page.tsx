"use client";

import PageLayout from "@/components/layout/PageLayout";
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
    <PageLayout headerProps={{ title: "Tài khoản", showSearch: false, showBack: true }}>
      <div className="space-y-4 py-4">
        {/* User Info */}
        <div className="bg-card mx-4 rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Người dùng</h2>
            <p className="text-sm text-muted-foreground">+84 xxx xxx xxx</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Stats */}
        <div className="bg-card mx-4 rounded-xl p-4">
          <div className="grid grid-cols-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Đơn hàng</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Ưu đãi</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground">Voucher</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">1.2k</p>
              <p className="text-xs text-muted-foreground">Xu</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card mx-4 rounded-xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-4 px-4 py-3 ${
                index !== menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && (
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="mx-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 text-destructive">
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile;
