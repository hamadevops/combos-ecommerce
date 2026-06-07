'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';
import { useCategoryTree } from '@/hooks/useCategories';
import { getImageUrl } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { getSetting } = useShopSettings();
  const { data: categoryTree } = useCategoryTree();
  const categories = Array.isArray(categoryTree) ? categoryTree : [];
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const storeName = getSetting('store_name', 'MUATAIKHOANONLINE');
  const storeLogo = getSetting('store_logo');

  const logoUrl = storeLogo ? getImageUrl(storeLogo) : null;

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
    <>
      <header className="fixed top-0 left-0 right-0 bg-purple-600 text-white z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-16">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-purple-700 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={storeName} 
                className="h-9 w-auto object-contain bg-white rounded p-0.5" 
              />
            ) : (
              <span className="text-xl font-bold uppercase">{storeName}</span>
            )}
          </Link>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-purple-700 rounded-lg"
            >
              <Search size={20} />
            </button>
            <Link href="/cart" className="p-2 hover:bg-purple-700 rounded-lg relative">
              <ShoppingCart size={20} />
              {mounted && getTotalItems() > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Expandable Search */}
        {isSearchOpen && (
          <div className="px-4 pb-3 pt-1 bg-purple-600">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="w-full rounded-full py-2 px-4 pr-10 text-gray-800 focus:outline-none"
                autoFocus
              />
              <button className="absolute right-3 top-2 text-gray-500">
                <Search size={18} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div className={`fixed inset-y-0 left-0 w-[280px] bg-white z-[70] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold text-purple-600">MENU</div>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col py-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          {menuItems.map((item: any, idx: number) => {
            const children = item.isCategoryList
              ? categories.map((cat: any) => ({ title: cat.name, url: `/danh-muc/${cat.slug}`, children: cat.children }))
              : (Array.isArray(item.children) ? item.children : []);
            const hasChildren = children.length > 0;

            return (
              <div key={idx} className="flex flex-col border-b last:border-b-0">
                <Link 
                  href={item.url || "#"} 
                  className="px-4 py-3 text-gray-800 hover:bg-gray-50 font-semibold flex items-center justify-between" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.title}</span>
                </Link>
                {hasChildren && (
                  <div className="bg-gray-50/50 flex flex-col pl-4 border-l-2 border-purple-200">
                    {children.map((child: any, childIdx: number) => {
                      const grandchildren = child.isCategoryList
                        ? categories.map((cat: any) => ({ title: cat.name, url: `/danh-muc/${cat.slug}` }))
                        : (Array.isArray(child.children)
                          ? child.children
                          : (child.children
                            ? child.children.map((c: any) => ({ title: c.name, url: `/danh-muc/${c.slug}` }))
                            : []));
                      const hasGrandchildren = grandchildren.length > 0;

                      return (
                        <div key={childIdx} className="flex flex-col border-b border-gray-100 last:border-b-0">
                          <Link
                            href={child.url || "#"}
                            className="px-4 py-2 text-sm text-gray-700 hover:text-purple-600 font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.title}
                          </Link>
                          {hasGrandchildren && (
                            <div className="bg-gray-100/30 flex flex-col pl-4 border-l border-gray-300 pb-1.5 gap-1">
                              {grandchildren.map((grand: any, grandIdx: number) => (
                                <Link
                                  key={grandIdx}
                                  href={grand.url || "#"}
                                  className="px-4 py-1 text-xs text-gray-500 hover:text-purple-600"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  {grand.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
