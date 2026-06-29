'use client';

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { useForm } from 'react-hook-form';
import { useShopSettings } from '@/hooks/useShopSettings';

export default function Contact() {
  type ContactFormData = {
    name: string;
    email: string;
    phone: string;
    message: string;
  };

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ContactFormData>();
  const { getSetting } = useShopSettings();

  const address = getSetting('contact_address', '23 ĐƯỜNG SỐ 4 - CITYLAND - P GÒ VẤP - HCM');
  const phone = getSetting('contact_phone', '0919 045 290');
  const email = getSetting('contact_email', 'hotro@muataikhoanonline.com');
  const mapIframe = getSetting('map_iframe');

  const onSubmit = async (data: ContactFormData) => {
    try {
      const { contactsSubmitContactForm } = await import('@projects/shared');
      const Cookies = (await import('js-cookie')).default;
      const { toast } = await import('sonner');
      
      const utmFields = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent'];
      const marketingData: Record<string, string> = {};
      utmFields.forEach((field) => {
        const val = Cookies.get(field);
        if (val) marketingData[field] = val;
      });

      await contactsSubmitContactForm({
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          ...marketingData,
        }
      });
      toast.success('Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!');
      reset();
    } catch (error) {
      const { toast } = await import('sonner');
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  const renderMap = () => {
    if (!mapIframe) return null;
    
    if (typeof mapIframe === 'string' && mapIframe.trim().startsWith('<iframe')) {
      return (
        <div 
          className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: mapIframe }}
        />
      );
    }
    
    return (
      <iframe 
        src={String(mapIframe)} 
        className="w-full h-full border-0" 
        allowFullScreen 
        loading="lazy"
      />
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Liên hệ</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-l-4 border-red-600 pl-4">
          Liên hệ với chúng tôi
        </h1>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 flex flex-col lg:flex-row">
          
          {/* Left Column: Contact Info */}
          <div className="lg:w-1/3 bg-gray-900 text-white p-8 lg:p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6">Thông tin liên hệ</h3>
              <p className="text-gray-300 mb-8 leading-relaxed text-sm">
                Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn 24/7. Đừng ngần ngại liên hệ nhé!
              </p>
              
              <div className="space-y-6">
                {address && (
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase mb-1">Địa chỉ</h4>
                      <p className="text-gray-300 text-sm">{address}</p>
                    </div>
                  </div>
                )}
                
                {phone && (
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase mb-1">Điện thoại</h4>
                      <p className="text-gray-300 text-sm">{phone}</p>
                    </div>
                  </div>
                )}
                
                {email && (
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase mb-1">Email</h4>
                      <p className="text-gray-300 text-sm">{email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:w-2/3 p-8 lg:p-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h3>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                  <input 
                    {...register('name', { required: true })}
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                    placeholder="Nhập họ tên của bạn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input 
                    {...register('email', { required: true })}
                    type="email" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                    placeholder="Nhập địa chỉ email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input 
                  {...register('phone')}
                  type="tel" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lời nhắn *</label>
                <textarea 
                  {...register('message', { required: true })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
                  placeholder="Nhập nội dung cần liên hệ"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-colors w-full md:w-auto disabled:opacity-70"
              >
                {isSubmitting ? (
                  'ĐANG GỬI...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Gửi liên hệ
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
        
        {/* Map */}
        {mapIframe && (
          <div className="bg-gray-200 rounded-2xl h-96 w-full flex items-center justify-center text-gray-500 overflow-hidden shadow-sm relative mb-8">
            {renderMap()}
          </div>
        )}

      </div>
    </div>
  );
}
