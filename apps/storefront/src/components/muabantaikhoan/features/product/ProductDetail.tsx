"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, Send, Phone, ShieldCheck, HeadphonesIcon, RefreshCw, Gift } from "lucide-react";
import ProductCard from "../../shared/cards/ProductCard";
import { getImageUrl } from "@/lib/utils";
import ProductVariantsSection from "@/components/tiktok/products/ProductDetail/ProductVariantsSection";

interface MuabanProductDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relatedProducts: any[];
  onAddToCart: (variant?: any) => void;
  onBuyNow: (variant?: any) => void;
}

export default function MuabanProductDetail({
  product,
  relatedProducts,
  onAddToCart,
  onBuyNow,
}: MuabanProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  // Fallback data if product is incomplete
  const name = product?.name || "Tên sản phẩm";
  
  // Use selected variant price/salePrice if available
  const variantPrice = selectedVariant ? selectedVariant.price : product?.price;
  const variantSalePrice = selectedVariant ? selectedVariant.salePrice : product?.salePrice;

  const originalPrice = product?.originalPrice || variantPrice * 1.2 || 0;
  const currentPrice = variantSalePrice || variantPrice || 0;
  const discountPercent = product?.discount_percent || Math.round((1 - currentPrice / originalPrice) * 100) || 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = product?.images?.map((img: any) => getImageUrl(img.url)).filter(Boolean) || [];

  // Find if any selected option has an imageUrl and use it as thumbnail
  let variantThumbnail = null;
  if (selectedVariant && product.tierVariations) {
    const optWithImg = product.tierVariations
      .flatMap((t: any) => t.options || [])
      .find((opt: any) => 
        opt.imageUrl && 
        selectedVariant.optionValues?.includes(opt.value)
      );
    if (optWithImg && optWithImg.imageUrl) {
      variantThumbnail = getImageUrl(optWithImg.imageUrl);
    }
  }

  const thumbnail = variantThumbnail || images[0] || getImageUrl(product?.thumbnail) || "https://placehold.co/600";

  // Extract features from shortDescription if available, else generic tools fallback
  const features = product?.shortDescription
    ? product.shortDescription.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [
        "Cam kết hàng chính hãng 100%",
        "Bảo hành chính hãng toàn quốc",
        "Đổi trả trong 7 ngày nếu lỗi do nhà sản xuất",
        "Hỗ trợ kỹ thuật trọn đời",
      ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          {product?.categories?.[0] ? (
            <>
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="hover:text-primary transition-colors"
              >
                {product.categories[0].name}
              </Link>
              <span className="mx-2">/</span>
            </>
          ) : (
            <>
              <Link href="/category" className="hover:text-primary transition-colors">
                Danh mục
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{name}</span>
        </nav>

        {/* Top Section: 3 Columns on Desktop */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Image Gallery (Span 4) */}
            <div className="lg:col-span-4 relative">
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                  -{discountPercent}%
                </div>
              )}
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative mb-4">
                <img
                  src={thumbnail}
                  alt={name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              {/* Optional: Thumbnails could go here if there are multiple images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:border-primary bg-white p-1">
                      <img src={img} alt={`${name} ${idx}`} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Product Info & Actions (Span 5) */}
            <div className="lg:col-span-5 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{name}</h1>
              
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold text-red-600">{formatPrice(currentPrice)}</span>
                {originalPrice > currentPrice && (
                  <span className="text-gray-400 line-through text-lg mb-1">{formatPrice(originalPrice)}</span>
                )}
              </div>

              {/* Short Features List */}
              <ul className="space-y-3 mb-6">
                {features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Status and Contact */}
              <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-green-600">Còn hàng</span>
                </div>
                <button className="flex items-center gap-2 text-sm text-primary font-medium hover:text-red-600 transition-colors">
                  <Phone className="w-4 h-4" />
                  Liên hệ tư vấn
                </button>
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <ProductVariantsSection
                    product={product}
                    selectedVariant={selectedVariant}
                    onChange={setSelectedVariant}
                  />
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    value={quantity}
                    readOnly
                    className="w-12 text-center text-sm font-medium border-x border-gray-300 py-1.5 focus:outline-none"
                  />
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <button 
                  onClick={() => onAddToCart(selectedVariant)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
                <button 
                  onClick={() => onBuyNow(selectedVariant)}
                  className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Column 3: Promos & Policies (Span 3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Promo Box */}
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 py-2 text-center border-b border-red-200">
                  <h3 className="text-red-600 font-bold text-sm uppercase flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4" />
                    Khuyến mãi đặc biệt
                  </h3>
                </div>
                <div className="p-4 bg-white">
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Gift className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Giảm thêm 5% khi thanh toán qua chuyển khoản.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Gift className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>Miễn phí giao hàng toàn quốc cho đơn hàng từ 1.000.000đ.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Policy Box */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-900 py-2 text-center border-b border-gray-900">
                  <h3 className="text-white font-bold text-sm uppercase">
                    Chính sách mua hàng
                  </h3>
                </div>
                <div className="p-4 bg-white">
                  <ul className="space-y-4 text-sm text-gray-700">
                    <li className="flex items-start gap-3">
                      <RefreshCw className="w-5 h-5 text-primary shrink-0" />
                      <span>Đổi trả 7 ngày nếu có lỗi từ nhà sản xuất.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                      <span>Hàng chính hãng, nguồn gốc rõ ràng, đầy đủ tem mác.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <HeadphonesIcon className="w-5 h-5 text-primary shrink-0" />
                      <span>Hỗ trợ kỹ thuật chuyên sâu 24/7.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Send className="w-5 h-5 text-primary shrink-0" />
                      <span>Giao hàng siêu tốc tận nơi trên toàn quốc.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs & Description */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button className="px-6 py-4 text-sm font-bold text-red-600 border-b-2 border-red-600 bg-gray-50">
              THÔNG TIN SẢN PHẨM
            </button>
          </div>
          
          <div className="p-6 lg:p-8 text-gray-700 leading-relaxed text-sm lg:text-base prose max-w-none">
            {product?.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <div className="space-y-4">
                <p>
                  <strong>{name}</strong> là một công cụ mạnh mẽ và bền bỉ dành cho công việc của bạn. Mua hàng tại hệ thống của chúng tôi để được đảm bảo hàng chính hãng với giá tốt nhất thị trường.
                </p>
                <h4 className="font-bold text-gray-900 mt-6">Cam kết chất lượng:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sản phẩm chính hãng 100%, nguyên đai nguyên kiện.</li>
                  <li>Hoạt động mạnh mẽ, bền bỉ trong môi trường khắc nghiệt.</li>
                  <li>Phụ kiện thay thế luôn sẵn có.</li>
                  <li>Bảo hành nhanh chóng, uy tín.</li>
                </ul>
                <h4 className="font-bold text-gray-900 mt-6">Lưu ý khi sử dụng:</h4>
                <p>
                  Vui lòng đọc kỹ hướng dẫn sử dụng trước khi dùng. Trang bị đầy đủ bảo hộ lao động khi thao tác với máy móc để đảm bảo an toàn.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold uppercase text-gray-900 border-l-4 border-red-600 pl-3">
                Sản phẩm liên quan
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p, idx) => (
                <ProductCard key={idx} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
