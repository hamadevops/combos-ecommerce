"use client";

import React, { useState, useEffect } from 'react';
import QuickFeatures from './QuickFeatures';
import SectionWrapper from '../../shared/sections/SectionWrapper';
import ProductCard from '../../shared/cards/ProductCard';
import NewsCard from '../../shared/cards/NewsCard';
import HeroSlider from './HeroSlider';
import { useProducts } from '@/hooks/useProducts';
import { usePosts } from '@/hooks/usePosts';
import { useAppFeedbacks } from '@/hooks/useAppFeedbacks';
import { useCategories } from '@/hooks/useCategories';
import { getImageUrl } from '@/lib/utils';
import { Loader2, Star } from 'lucide-react';

export default function HomeContent() {
  // Fetch categories from database
  const { data: categoriesResponse } = useCategories();
  const categories = (categoriesResponse as any)?.data || [];

  // Section 1: Dụng cụ pin & điện (originally "HỌC TẬP – LÀM VIỆC")
  const [selectedWorkLearnCategoryId, setSelectedWorkLearnCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedWorkLearnCategoryId) {
      setSelectedWorkLearnCategoryId(categories[0].id);
    }
  }, [categories, selectedWorkLearnCategoryId]);

  // Section 3: Phụ kiện & Thiết bị khác (originally "PHẦN MỀM BẢN QUYỀN")
  const [selectedSoftwareCategoryId, setSelectedSoftwareCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (categories.length > 2 && !selectedSoftwareCategoryId) {
      setSelectedSoftwareCategoryId(categories[2].id);
    }
  }, [categories, selectedSoftwareCategoryId]);

  // Fetch data from API
  const { data: promoData, isLoading: isLoadingPromo } = useProducts({ type: 'recommended', limit: 8 });
  const { data: bestSellingData, isLoading: isLoadingBestSelling } = useProducts({ sort: 'best_selling', limit: 8 });
  
  const { data: workLearnData, isLoading: isLoadingWorkLearn } = useProducts({
    categoryIds: selectedWorkLearnCategoryId ? [selectedWorkLearnCategoryId] : undefined,
    limit: 8,
    enabled: !!selectedWorkLearnCategoryId
  });
  
  const { data: entertainmentData, isLoading: isLoadingEntertainment } = useProducts({
    categoryIds: categories[5] ? [categories[5].id] : undefined,
    limit: 8,
    enabled: categories.length > 5
  });
  
  const { data: softwareData, isLoading: isLoadingSoftware } = useProducts({
    categoryIds: selectedSoftwareCategoryId ? [selectedSoftwareCategoryId] : undefined,
    limit: 8,
    enabled: !!selectedSoftwareCategoryId
  });
  
  const { data: newsData, isLoading: isLoadingNews } = usePosts({ limit: 4 });
  const { data: feedbackData, isLoading: isLoadingFeedback } = useAppFeedbacks({ limit: 8 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapProductToCard = (product: any) => ({
    id: String(product.id),
    name: product.name,
    slug: product.slug,
    thumbnail: getImageUrl(product.images?.[0]?.url) || "",
    originalPrice: product.price,
    currentPrice: product.salePrice || product.price,
    discountPercent: product.discount_percent || (product.salePrice && product.price ? Math.round(((product.price - product.salePrice) / product.price) * 100) : undefined),
    tags: product.tags?.map((t: any) => t.name) || [],
    soldCount: product.sold_count || Math.floor(Math.random() * 100) + 10,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promoProducts = (promoData as any)?.data?.map(mapProductToCard) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workLearnProducts = (workLearnData as any)?.data?.map(mapProductToCard) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bestSellingProducts = (bestSellingData as any)?.data?.map(mapProductToCard) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entertainmentProducts = (entertainmentData as any)?.data?.map(mapProductToCard) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const softwareProducts = (softwareData as any)?.data?.map(mapProductToCard) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const techNews = (newsData as any)?.data?.map((post: any) => ({
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    thumbnail: post.thumbnail || "/images/technews_mock.png",
    excerpt: post.excerpt || "",
    date: new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN'),
  })) || [];

  const renderLoader = () => (
    <div className="flex justify-center items-center py-12 w-full">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feedbacks = (feedbackData as any)?.data || [];

  return (
    <div className="bg-white">
      <HeroSlider />

      <QuickFeatures />

      {/* 3 Banners Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#" className="block overflow-hidden rounded-xl hover:shadow-md transition-shadow">
            <img src="https://muataikhoanonline.com/wp-content/uploads/2025/01/350358279-c5b20c63-fb5d-42fe-9127-4288bbbd9675.png" alt="Phần mềm học tập" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </a>
          <a href="#" className="block overflow-hidden rounded-xl hover:shadow-md transition-shadow">
            <img src="https://muataikhoanonline.com/wp-content/uploads/2025/01/350358298-1940c6d8-d478-4653-b783-24c41128dfdf.png" alt="Bảo mật VPN" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </a>
          <a href="#" className="block overflow-hidden rounded-xl hover:shadow-md transition-shadow">
            <img src="https://muataikhoanonline.com/wp-content/uploads/2025/01/350358287-714b1b0e-ab81-41ad-b900-ea36ffc4dede.png" alt="Giải trí đa dạng" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
          </a>
        </div>
      </div>

      {/* TÀI KHOẢN, PHẦN MỀM KHUYẾN MÃI 🔥 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionWrapper 
          title="TÀI KHOẢN, PHẦN MỀM KHUYẾN MÃI" 
          icon={<span className="text-orange-500">🔥</span>}
          className="bg-gradient-to-b from-[#d8b4fe] to-[#a855f7] rounded-2xl my-8 py-10"
          titleClassName="text-white text-xl sm:text-2xl"
        >
          {isLoadingPromo ? renderLoader() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {promoProducts.map((p: any, i: number) => (
                <ProductCard key={i} {...p} />
              ))}
            </div>
          )}
        </SectionWrapper>
      </div>

      {/* PHẦN MỀM, TÀI KHOẢN BÁN CHẠY */}
      <SectionWrapper title="PHẦN MỀM, TÀI KHOẢN BÁN CHẠY" className="py-12">
        {isLoadingBestSelling ? renderLoader() : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {bestSellingProducts.map((p: any, i: number) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* HỌC TẬP – LÀM VIỆC */}
      <SectionWrapper title="DỤNG CỤ PIN & ĐIỆN" className="bg-white" viewAllLink="#">
        <div className="flex justify-center gap-4 mb-8">
          {categories.slice(0, 2).map((cat: any) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedWorkLearnCategoryId(cat.id)}
              className={`px-6 py-2 rounded-full border-2 font-bold text-sm transition-colors ${
                selectedWorkLearnCategoryId === cat.id 
                  ? "border-black bg-white text-black" 
                  : "border-gray-300 text-gray-500 bg-white hover:text-black hover:border-black font-normal"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {isLoadingWorkLearn ? renderLoader() : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {workLearnProducts.map((p: any, i: number) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* PHỤC VỤ GIẢI TRÍ */}
      <SectionWrapper 
        title={categories[5]?.name || "DỤNG CỤ ĐO LƯỜNG"} 
        className="bg-white" 
        viewAllLink="#"
      >
        <p className="text-center text-gray-500 mb-8 -mt-6">
          {categories[5]?.description ? categories[5].description.replace(/<[^>]*>/g, '') : "Các loại máy cân bằng laser, thước đo điện tử"}
        </p>
        {isLoadingEntertainment ? renderLoader() : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {entertainmentProducts.map((p: any, i: number) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* SẢN PHẨM MỚI NHẤT & Banner Elsa */}
      <SectionWrapper title="SẢN PHẨM MỚI NHẤT" className="bg-white mb-8" viewAllLink="#">
        <div className="w-full bg-[#f8f9fe] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="md:w-1/2 z-10 relative">
            <span className="text-red-500 text-sm font-semibold mb-2 block">Nâng cấp Elsa Premium chính chủ</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              ELSA Premium chính là gói học tiếng Anh cao cấp nhất của ELSA tính tới thời điểm hiện tại.
            </h3>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Với gói học này, người dùng có thể truy cập vào các gói học và sử dụng các tính năng hàng đầu của ELSA như ELSA Pro, ELSA AI và ELSA Speech Analyzer.
              Đặc biệt, bộ đôi tính năng mới ứng dụng công nghệ AI - ELSA Speech Analyzer và ELSA AI, có thể hỗ trợ người dùng tự do luyện tập giao tiếp không giới hạn bối cảnh và nội dung đối thoại.
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
              Nâng cấp ngay &gt;
            </button>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 relative z-10 flex justify-center">
            {/* Placeholder for the Elsa banner image */}
            <img src="/images/elsa_premium_mockup.png" alt="Elsa Premium" className="w-full max-w-md object-contain mix-blend-multiply" />
          </div>
          
          {/* Background decorative circles */}
          <div className="absolute top-10 right-10 w-20 h-20 rounded-full border-4 border-gray-200/50"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-purple-100/30 blur-2xl"></div>
        </div>
      </SectionWrapper>

      {/* PHẦN MỀM BẢN QUYỀN */}
      <SectionWrapper title="PHỤ KIỆN & THIẾT BỊ KHÁC" className="bg-white" viewAllLink="#">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {categories.slice(2, 5).map((cat: any) => (
            <button 
              key={cat.id}
              onClick={() => setSelectedSoftwareCategoryId(cat.id)}
              className={`px-4 py-2 rounded-full border-2 font-bold text-xs sm:text-sm transition-colors ${
                selectedSoftwareCategoryId === cat.id 
                  ? "border-black bg-white text-black" 
                  : "border-gray-300 text-gray-500 bg-white hover:text-black hover:border-black font-normal"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {isLoadingSoftware ? renderLoader() : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {softwareProducts.map((p: any, i: number) => (
              <ProductCard key={i} {...p} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* TIN TỨC CÔNG NGHỆ */}
      <SectionWrapper title="TIN TỨC CÔNG NGHỆ" className="bg-white" viewAllLink="#">
        {isLoadingNews ? renderLoader() : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {techNews.map((news: any) => (
              <NewsCard key={news.id} {...news} />
            ))}
          </div>
        )}
      </SectionWrapper>

      {/* ĐÁNH GIÁ KHÁCH HÀNG */}
      <SectionWrapper title="ĐÁNH GIÁ KHÁCH HÀNG" className="bg-white pb-16">
        {isLoadingFeedback ? renderLoader() : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {feedbacks.map((fb: any) => (
              <div key={fb.id} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                {fb.image && (
                  <div className="overflow-hidden">
                    <img
                      src={fb.image}
                      alt={`Feedback from ${fb.customerName}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {fb.customerAvatar ? (
                      <img
                        src={fb.customerAvatar}
                        alt={fb.customerName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-sm">{fb.customerName?.[0] || '?'}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{fb.customerName}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{fb.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
