'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, MessageCircle, Send, Instagram } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useShopSettings } from '@/hooks/useShopSettings';
import { usePages } from '@/hooks/usePages';

export default function DesktopFooter() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ email: string }>();
  const { getSetting } = useShopSettings();
  const { data: pages } = usePages();

  const storeName = getSetting('store_name', 'MUATAIKHOANONLINE');
  const companyName = getSetting('company_name', 'CÔNG TY TNHH PHÁT TRIỂN VÀ DỊCH VỤ HDV');
  const address = getSetting('contact_address', '23 Đường 4 Khu dân cư City Land Park, Phường Gò Vấp, TP. Hồ Chí Minh');
  const mst = getSetting('store_mst', getSetting('mst', '0319078716'));
  const phone = getSetting('contact_phone', '0919 045 290');
  const email = getSetting('contact_email', 'support@shopacconline.com');

  const facebookUrl = getSetting('social_facebook', '#');
  const zaloUrl = getSetting('social_zalo', '#');
  const tiktokUrl = getSetting('social_tiktok', '#');
  const instagramUrl = getSetting('social_instagram', '#');

  const copyrightText = getSetting('footer_copyright', 'Copyright 2026 © SHOPACCONLINE.COM');

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
    <footer className="bg-white mt-12">
      {/* Newsletter */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center">
          <h3 className="text-xl font-bold mb-2">Đăng ký nhận tin tức, khuyến mãi của shop</h3>
          <p className="text-gray-600 mb-6">Nhận thông tin sản phẩm mới nhất và các chương trình khuyến mãi.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full max-w-md">
            <input 
              {...register('email', { required: true })}
              type="email" 
              placeholder="Nhập địa chỉ Email" 
              className="flex-grow border border-gray-300 rounded-l-full py-2 px-4 focus:outline-none focus:border-purple-500"
              required
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-2 rounded-r-full hover:bg-gray-800 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'ĐANG GỬI...' : 'ĐĂNG KÝ'}
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="text-xl font-bold text-purple-600 mb-4 uppercase">
            {storeName}
          </div>
          {companyName && <h4 className="font-bold mb-2 uppercase">{companyName}</h4>}
          {address && <p className="text-sm text-gray-600 mb-2"><strong>Trụ sở chính:</strong> {address}</p>}
          {mst && <p className="text-sm text-gray-600 mb-2"><strong>MST:</strong> {mst}</p>}
          {phone && <p className="text-sm text-gray-600 mb-2"><strong>Điện thoại:</strong> {phone}</p>}
          {email && <p className="text-sm text-gray-600"><strong>Email:</strong> {email}</p>}
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase">Chính sách</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {pages && pages.length > 0 ? (
              pages.filter(p => p.isActive).map((page) => (
                <li key={page.id}>
                  <Link href={`/pages/${page.slug}`} className="hover:text-purple-600">
                    {page.title}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/pages/chinh-sach-mua-hang" className="hover:text-purple-600">Chính sách mua hàng</Link></li>
                <li><Link href="/pages/chinh-sach-bao-hanh" className="hover:text-purple-600">Chính sách bảo hành</Link></li>
                <li><Link href="/pages/cam-ket" className="hover:text-purple-600">Cam kết của hàng</Link></li>
                <li><Link href="/pages/cong-tac-vien" className="hover:text-purple-600">Chính sách cộng tác viên</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 uppercase">Thông tin mạng xã hội</h4>
          <div className="flex gap-4 mb-6">
            {facebookUrl && facebookUrl !== '#' && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:opacity-80"><Facebook size={24} /></a>
            )}
            {zaloUrl && zaloUrl !== '#' && (
              <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:opacity-80"><MessageCircle size={24} /></a>
            )}
            {tiktokUrl && tiktokUrl !== '#' && (
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-black hover:opacity-80"><Send size={24} /></a>
            )}
            {instagramUrl && instagramUrl !== '#' && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:opacity-80"><Instagram size={24} /></a>
            )}
          </div>

          <h4 className="font-bold mb-3 uppercase text-sm">Hỗ trợ thanh toán</h4>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
            <span className="border border-gray-300 rounded px-2 py-1 bg-gray-50">ATM</span>
            <span className="border border-gray-300 rounded px-2 py-1 bg-gray-50 text-blue-600">VNPAY</span>
            <span className="border border-gray-300 rounded px-2 py-1 bg-gray-50 text-purple-600">MOCA</span>
            <span className="border border-gray-300 rounded px-2 py-1 bg-gray-50 text-pink-600">MOMO</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-purple-600 text-white text-center py-3 text-sm">
        {copyrightText}
      </div>
    </footer>
  );
}
