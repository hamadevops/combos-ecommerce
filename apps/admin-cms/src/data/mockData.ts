import banner1 from "@/assets/banners/banner1.png";
import banner2 from "@/assets/banners/banner2.png";

// Category Icons
import catMachines from "@/assets/categories/machines.png";
import catRepair from "@/assets/categories/repair.png";
import catAccessories from "@/assets/categories/accessories.png";
import catSafety from "@/assets/categories/safety.png";
import catElectronics from "@/assets/categories/electronics.png";
import catMeasurement from "@/assets/categories/measurement.png";
import catPaint from "@/assets/categories/paint.png";
import catMaterials from "@/assets/categories/materials.png";

// Product Images (Local)
import productSaw from "@/assets/products/saw.png";
import productDrillBits from "@/assets/products/drill_bits.png";
import productPaintGun from "@/assets/products/paint_gun.png";
import productScrewsBolts from "@/assets/products/screws_bolts.png";
import productTapeMeasure from "@/assets/products/tape_measure.png";
import productSolderingIron from "@/assets/products/soldering_iron.png";
import productMultimeter from "@/assets/products/multimeter.png";

import { Product } from "@/types/product";
import { Category } from "@/types/category";

export interface Banner {
  id: string;
  image: string;
  title: string;
  link: string;
}

export const categories: Category[] = [
  {
    id: 1,
    name: "Máy móc",
    slug: "may-moc",
    image: catMachines,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: "",
  },
  {
    id: 2,
    name: "Sửa chữa",
    slug: "sua-chua",
    image: catRepair,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: "",
  },
  // Add other categories similarly if needed, keeping it short for now or mapping old ones
];

// Helper to create mock product
const createMockProduct = (
  id: number,
  name: string,
  slug: string,
  price: number,
  image: string,
  categoryId: number,
): Product => ({
  id,
  name,
  slug,
  price,
  salePrice: null,
  costPrice: null,
  stock: 100,
  isActive: 1,
  isFeatured: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [
    {
      id: id * 10,
      url: image, // In real app, this would be a full URL, here we use imported asset
      position: 1,
    },
  ],
  variants: [],
  categories: [{ id: categoryId, name: "Danh mục", slug: "danh-muc" }],
});

export const products: Product[] = [
  createMockProduct(
    1,
    "Máy Khoan Pin Cầm Tay Đa Năng 21V",
    "may-khoan-pin-cam-tay-da-nang-21v",
    622499,
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=800&auto=format&fit=crop",
    1,
  ),
  createMockProduct(
    2,
    "Máy Mài Góc Cầm Tay Công Suất Lớn",
    "may-mai-goc-cam-tay-cong-suat-lon",
    366930,
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=800&auto=format&fit=crop",
    1,
  ),
  createMockProduct(
    3,
    "Bộ Cờ Lê Đa Năng Thép Chrome Vanadium",
    "bo-co-le-da-nang-thep-chrome-vanadium",
    887270,
    "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?q=80&w=800&auto=format&fit=crop",
    2,
  ),
  createMockProduct(
    4,
    "Hộp Đựng Dụng Cụ Sửa Chữa Đa Năng",
    "hop-dung-dung-cu-sua-chua-da-nang",
    586500,
    "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop",
    2,
  ),
  createMockProduct(5, "Bộ Mũi Khoan Hợp Kim", "bo-mui-khoan-hop-kim", 350000, productDrillBits, 3),
];

export const banners: Banner[] = [
  {
    id: "1",
    image: banner1,
    title: "Siêu Sale Dụng Cụ",
    link: "/sale",
  },
  {
    id: "2",
    image: banner2,
    title: "Hàng Mới Về",
    link: "/new-arrivals",
  },
];
