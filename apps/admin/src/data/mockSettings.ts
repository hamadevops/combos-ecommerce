export interface Setting {
  id: number;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  group: "general" | "contact" | "social" | "ecommerce" | "appearance";
  label: string; // Helper for UI
  description?: string; // Helper for UI
}

export const mockSettings: Setting[] = [
  // General (Store Info)
  {
    id: 1,
    group: "general",
    key: "store_name",
    value: "Thiên Phú Store VN",
    type: "string",
    label: "Tên cửa hàng",
  },
  {
    id: 2,
    group: "general",
    key: "store_logo",
    value: "https://placehold.co/200x200/FFD700/FFFFFF?text=TP",
    type: "string",
    label: "Logo cửa hàng",
  },
  {
    id: 3,
    group: "appearance",
    key: "store_background",
    value: "https://placehold.co/800x400/333333/FFFFFF?text=Background",
    type: "string",
    label: "Hình nền (Background)",
  },
  {
    id: 4,
    group: "general",
    key: "store_description",
    value: "Chuyên cung cấp dụng cụ cơ khí chuyên nghiệp",
    type: "string",
    label: "Mô tả ngắn",
  },
  {
    id: 5,
    group: "general",
    key: "store_rating",
    value: "5.0",
    type: "number",
    label: "Đánh giá (Sao)",
  },

  // Slider (New group or general)
  {
    id: 6,
    group: "appearance",
    key: "home_slider",
    value: JSON.stringify([
      { image: "https://placehold.co/800x400/111/FFF?text=Slider1", link: "/products" },
      { image: "https://placehold.co/800x400/222/FFF?text=Slider2", link: "/category/electronics" },
    ]),
    type: "json",
    label: "Slider trang chủ",
  },
  {
    id: 15,
    group: "appearance",
    key: "client_theme",
    value: "tiktok",
    type: "string",
    label: "Giao diện client",
    description: "Chọn giao diện hiển thị cho website (tiktok hoặc muabantaikhoan)",
  },

  // Contact
  {
    id: 7,
    group: "contact",
    key: "contact_email",
    value: "support@thienphustore.vn",
    type: "string",
    label: "Email liên hệ",
  },
  {
    id: 8,
    group: "contact",
    key: "contact_phone",
    value: "0901234567",
    type: "string",
    label: "Hotline",
  },
  {
    id: 9,
    group: "contact",
    key: "contact_address",
    value: "Hà Nội, Việt Nam",
    type: "string",
    label: "Địa chỉ",
  },
  {
    id: 12,
    group: "contact",
    key: "map_iframe",
    value: "https://www.google.com/maps/embed?...",
    type: "string",
    label: "Google Maps Iframe",
  },

  // Social
  {
    id: 10,
    group: "social",
    key: "social_facebook",
    value: "https://facebook.com",
    type: "string",
    label: "Facebook",
  },
  {
    id: 13,
    group: "social",
    key: "social_instagram",
    value: "https://instagram.com",
    type: "string",
    label: "Instagram",
  },
  {
    id: 14,
    group: "social",
    key: "social_zalo",
    value: "https://zalo.me",
    type: "string",
    label: "Zalo",
  },
  {
    id: 11,
    group: "social",
    key: "social_tiktok",
    value: "https://tiktok.com",
    type: "string",
    label: "TikTok",
  },
];
