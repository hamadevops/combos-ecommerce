'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, MessageCircle, Send, ChevronDown, ChevronUp, Instagram } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useShopSettings } from '@/hooks/useShopSettings';
import { usePages } from '@/hooks/usePages';

export default function MobileFooter() {
  const [openSection, setOpenSection] = useState<string | null>('policy');

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ email: string }>();
  const { getSetting } = useShopSettings();
  const { data: pages } = usePages();

  const storeName = getSetting('store_name', 'MUATAIKHOANONLINE');
  const companyName = getSetting('company_name', 'CÔNG TY TNHH PHÁT TRIỂN VÀ DỊCH VỤ HDV');
  const address = getSetting('contact_address', '23 Đường 4 KDC City Land Park, Gò Vấp, HCM');
  const mst = getSetting('store_mst', getSetting('mst', '0319078716'));
  const phone = getSetting('contact_phone', '0919 045 290');
  const email = getSetting('contact_email', 'support@shopacconline.com');

  const facebookUrl = getSetting('social_facebook', '#');
  const zaloUrl = getSetting('social_zalo', '#');
  const tiktokUrl = getSetting('social_tiktok', '#');
  const instagramUrl = getSetting('social_instagram', '#');

  const copyrightText = getSetting('footer_copyright', 'Copyright 2026 © SHOPACCONLINE.COM');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const onSubmit = async (data: { email: string }) => {
    try {
      const { contactsSubmitNewsletter } = await import('@vibe/shared');
      const Cookies = (await import('js-cookie')).default;
      const { toast } = await import('sonner');
      
      const utmFields = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent'];
      const marketingData: Record<string, string> = {};
      utmFields.forEach((field) => {
        const val = Cookies.get(field);
        if (val) marketingData[field] = val;
      });

      await contactsSubmitNewsletter({
        body: {
          email: data.email,
          ...marketingData,
        }
      });
      toast.success('Đăng ký nhận tin thành công!');
      reset();
    } catch (error) {
      const { toast } = await import('sonner');
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  return (
    <footer className="bg-white mt-8">
      {/* Newsletter */}
      <div className="bg-gray-50 py-8 px-4 text-center">
        <h3 className="text-lg font-bold mb-2">Đăng ký nhận tin tức</h3>
        <p className="text-sm text-gray-600 mb-4">Nhận thông tin sản phẩm mới nhất.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full">
          <input 
            {...register('email', { required: true })}
            type="email" 
            placeholder="Nhập địa chỉ Email" 
            className="flex-grow border border-gray-300 rounded-l-full py-2 px-4 text-sm focus:outline-none focus:border-purple-500"
            required
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-black text-white px-4 py-2 rounded-r-full text-sm font-semibold disabled:opacity-70"
          >
            {isSubmitting ? 'ĐANG GỬI...' : 'ĐĂNG KÝ'}
          </button>
        </form>
      </div>

      {/* Accordion Footer Info */}
      <div className="px-4 py-6">
        <div className="mb-6 text-center">
          <div className="text-xl font-bold text-purple-600 mb-2 uppercase">{storeName}</div>
          {companyName && <p className="text-xs font-bold text-gray-700 mb-1 uppercase">{companyName}</p>}
          {mst && <p className="text-xs text-gray-600 mb-1"><strong>MST:</strong> {mst}</p>}
          {phone && <p className="text-xs text-gray-600 mb-1"><strong>Điện thoại:</strong> {phone}</p>}
          {email && <p className="text-xs text-gray-600 mb-1"><strong>Email:</strong> {email}</p>}
          {address && <p className="text-xs text-gray-600"><strong>Trụ sở:</strong> {address}</p>}
        </div>

        {/* Accordion 1: Chính sách */}
        <div className="border-b py-3">
          <button 
            className="flex justify-between items-center w-full font-bold uppercase text-sm"
            onClick={() => toggleSection('policy')}
          >
            <span>Chính sách</span>
            {openSection === 'policy' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSection === 'policy' && (
            <ul className="space-y-3 text-sm text-gray-600 mt-3 pl-2">
              {pages && pages.length > 0 ? (
                pages.filter(p => p.isActive).map((page) => (
                  <li key={page.id}>
                    <Link href={`/pages/${page.slug}`}>{page.title}</Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/pages/chinh-sach-mua-hang">Chính sách mua hàng</Link></li>
                  <li><Link href="/pages/chinh-sach-bao-hanh">Chính sách bảo hành</Link></li>
                  <li><Link href="/pages/cam-ket">Cam kết của hàng</Link></li>
                  <li><Link href="/pages/cong-tac-vien">Chính sách cộng tác viên</Link></li>
                </>
              )}
            </ul>
          )}
        </div>

        {/* Accordion 2: Mạng xã hội */}
        <div className="border-b py-3">
          <button 
            className="flex justify-between items-center w-full font-bold uppercase text-sm"
            onClick={() => toggleSection('social')}
          >
            <span>Thông tin mạng xã hội</span>
            {openSection === 'social' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openSection === 'social' && (
            <div className="flex gap-4 mt-3 pl-2">
              {facebookUrl && facebookUrl !== '#' && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600"><Facebook size={24} /></a>
              )}
              {zaloUrl && zaloUrl !== '#' && (
                <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400"><MessageCircle size={24} /></a>
              )}
              {tiktokUrl && tiktokUrl !== '#' && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-black"><Send size={24} /></a>
              )}
              {instagramUrl && instagramUrl !== '#' && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-500"><Instagram size={24} /></a>
              )}
            </div>
          )}
        </div>

        {/* Payment Support Info */}
        <div className="py-4">
          <p className="font-bold uppercase text-xs text-gray-700 mb-2 pl-1">Hỗ trợ thanh toán</p>
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-gray-500 pl-1">
            <span className="border border-gray-300 rounded px-2 py-0.5 bg-gray-50">ATM</span>
            <span className="border border-gray-300 rounded px-2 py-0.5 bg-gray-50 text-blue-600">VNPAY</span>
            <span className="border border-gray-300 rounded px-2 py-0.5 bg-gray-50 text-purple-600">MOCA</span>
            <span className="border border-gray-300 rounded px-2 py-0.5 bg-gray-50 text-pink-600">MOMO</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-600 text-white text-center py-3 text-xs">
        {copyrightText}
      </div>
    </footer>
  );
}
