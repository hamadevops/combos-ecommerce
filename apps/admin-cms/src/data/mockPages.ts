export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  updatedAt: string;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaImage?: string;
}

export const mockPages: Page[] = [
  {
    id: "1",
    title: "Giới thiệu",
    slug: "gioi-thieu",
    content: "<p>Xin chào, chúng tôi là Luxe Store...</p>",
    status: "published",
    updatedAt: "2023-12-01T10:00:00Z",
    order: 1,
    metaTitle: "Giới thiệu về Luxe Store - Thời trang chính hãng",
    metaDescription:
      "Luxe Store chuyên cung cấp các sản phẩm thời trang nam nữ chính hãng, uy tín, chất lượng.",
    metaKeywords: "gioi thieu, luxe store, thoi trang",
  },
  {
    id: "2",
    title: "Chính sách bảo mật",
    slug: "chinh-sach-bao-mat",
    content: "<p>Chúng tôi cam kết bảo mật thông tin...</p>",
    status: "published",
    updatedAt: "2023-11-15T09:30:00Z",
    order: 2,
  },
  {
    id: "3",
    title: "Điều khoản dịch vụ",
    slug: "dieu-khoan-dich-vu",
    content: "<p>Quy định sử dụng dịch vụ...</p>",
    status: "published",
    updatedAt: "2023-11-15T09:30:00Z",
    order: 3,
  },
  {
    id: "4",
    title: "Liên hệ",
    slug: "lien-he",
    content: "<p>Thông tin liên hệ...</p>",
    status: "published",
    updatedAt: "2023-12-20T14:00:00Z",
    order: 4,
  },
];
