'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, Phone, MapPin } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';
import { getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

import { useCategoryTree } from '@/hooks/useCategories';

export default function DesktopHeader() {
  const { getSetting } = useShopSettings();
  const { data: categoryTree } = useCategoryTree();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storeName = getSetting('store_name', 'MUATAIKHOANONLINE');
  const storeLogo = getSetting('store_logo');
  const address = getSetting('contact_address', '23 ĐƯỜNG SỐ 4 - CITYLAND - P GÒ VẤP - HCM');
  const phone = getSetting('contact_phone', '0919 045 290');

  const logoUrl = storeLogo ? getImageUrl(storeLogo) : null;
  const categories = Array.isArray(categoryTree) ? categoryTree : [];

  const columnsCount = 3;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[][] = [[], [], []];
  categories.forEach((cat: any, index: number) => {
    columns[index % columnsCount].push(cat);
  });

  const menuSetting = getSetting('main_menu');
  let menuItems: any[] = [];
  if (menuSetting) {
    try {
      menuItems = typeof menuSetting === 'string' ? JSON.parse(menuSetting) : menuSetting;
    } catch (e) {
      console.error('Failed to parse main_menu setting', e);
    }
  }

  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    menuItems = [
      { title: 'Trang chủ', url: '/' },
      { title: 'Giới thiệu', url: '/pages/about-us' },
      { title: 'Danh mục sản phẩm', url: '/danh-muc', isCategoryList: true },
      { title: 'Tin tức công nghệ', url: '/tin-tuc' },
      { title: 'Liên hệ', url: '/lien-he' }
    ];
  }

  return (
    <header className="w-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Top Section: Logo, Search, Contact */}
        <div className="flex items-center justify-between gap-8 mb-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col items-center">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={storeName} 
                className="h-12 w-auto object-contain mb-1" 
              />
            ) : (
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-1">
                <span className="text-purple-600 font-bold text-xl">🔑</span>
              </div>
            )}
            <div className="text-[10px] font-bold tracking-wider text-green-300 uppercase">{storeName}</div>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-grow max-w-2xl">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm tài khoản, khóa học, phần mềm..." 
                className="w-full rounded-full py-2.5 px-5 pr-12 text-gray-800 focus:outline-none"
              />
              <button className="absolute right-1 top-1 bottom-1 px-3 text-gray-600 hover:text-purple-600">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Contact & Cart */}
          <div className="flex items-center gap-6 flex-shrink-0 text-sm">
            {address && (
              <div className="flex items-center gap-2">
                <MapPin size={24} className="text-white/80 animate-bounce" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase opacity-80">Văn phòng</span>
                  <span className="font-semibold text-xs uppercase">{address}</span>
                </div>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2">
                <Phone size={24} className="text-white/80" />
                <div className="flex flex-col">
                  <span className="text-[10px] opacity-80">Hotline</span>
                  <span className="font-bold text-sm">{phone}</span>
                </div>
              </div>
            )}
            <Link href="/cart" className="hover:text-purple-200 ml-2 relative">
              <ShoppingCart size={28} />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Bottom Section: Navigation */}
        <nav className="flex items-center space-x-8 text-sm font-semibold pl-4">
          {menuItems.map((item: any, idx: number) => {
            if (item.isCategoryList) {
              return (
                <div key={idx} className="relative group">
                  <Link 
                    href={item.url || "/danh-muc"}
                    className="flex items-center gap-1 hover:text-pink-200 transition-colors focus:outline-none py-2"
                  >
                    {item.title} <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {categories.length > 0 && (
                    <div className="absolute top-full left-0 mt-0 w-[800px] bg-white text-gray-800 shadow-2xl rounded-lg border border-gray-100 z-50 p-6 flex-row gap-8 hidden group-hover:flex">
                      {columns.map((col, colIdx) => (
                        <div key={colIdx} className="flex-1 flex flex-col gap-6">
                          {col.map((parent) => (
                            <div key={parent.id}>
                              <Link 
                                href={`/danh-muc/${parent.slug}`}
                                className="font-bold text-sm mb-2 uppercase border-b pb-2 block hover:text-purple-600 transition-colors"
                              >
                                {parent.name}
                              </Link>
                              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                                {parent.children && parent.children.length > 0 ? (
                                  parent.children.map((child: any) => (
                                    <li key={child.id}>
                                      <Link 
                                        href={`/danh-muc/${child.slug}`}
                                        className="hover:text-purple-600 transition-colors"
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))
                                ) : (
                                  <li>
                                    <Link 
                                      href={`/danh-muc/${parent.slug}`}
                                      className="hover:text-purple-600 text-xs italic opacity-70 transition-colors"
                                    >
                                      Xem tất cả sản phẩm
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            if (Array.isArray(item.children) && item.children.length > 0) {
              const useMegaMenu = item.children.some(
                (child: any) => (Array.isArray(child.children) && child.children.length > 0) || child.isCategoryList
              );

              if (useMegaMenu) {
                return (
                  <div key={idx} className="relative group">
                    <Link 
                      href={item.url || "#"}
                      className="flex items-center gap-1 hover:text-pink-200 transition-colors focus:outline-none py-2"
                    >
                      {item.title} <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[800px] bg-white text-gray-800 shadow-2xl rounded-lg border border-gray-100 z-50 p-6 flex gap-8 hidden group-hover:flex">
                      {item.children.map((child: any, childIdx: number) => (
                        <div key={childIdx} className="flex-1 min-w-[150px] flex flex-col">
                          <Link 
                            href={child.url || "#"}
                            className="font-bold text-sm mb-2 uppercase border-b pb-2 block hover:text-purple-600 transition-colors"
                          >
                            {child.title}
                          </Link>
                          {child.isCategoryList && categories.length > 0 ? (
                            <ul className="flex flex-col gap-2 text-sm text-gray-600">
                              {categories.map((cat: any) => (
                                <li key={cat.id}>
                                  <Link 
                                    href={`/danh-muc/${cat.slug}`}
                                    className="hover:text-purple-600 transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            Array.isArray(child.children) && child.children.length > 0 && (
                              <ul className="flex flex-col gap-2 text-sm text-gray-600">
                                {child.children.map((grand: any, grandIdx: number) => (
                                  <li key={grandIdx}>
                                    <Link 
                                      href={grand.url || "#"}
                                      className="hover:text-purple-600 transition-colors"
                                    >
                                      {grand.title}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="relative group">
                  <Link 
                    href={item.url || "#"}
                    className="flex items-center gap-1 hover:text-pink-200 transition-colors focus:outline-none py-2"
                  >
                    {item.title} <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                  </Link>
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white text-gray-800 shadow-2xl rounded-lg border border-gray-100 z-50 p-2 hidden group-hover:flex flex-col gap-1">
                    {item.children.map((child: any, childIdx: number) => (
                      <Link 
                        key={childIdx}
                        href={child.url || "#"}
                        className="hover:text-purple-600 transition-colors px-3 py-2 text-sm rounded hover:bg-gray-50 block"
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link 
                key={idx}
                href={item.url || "#"} 
                className="hover:text-pink-200 transition-colors py-2"
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
