"use client";

import { MapPin, Phone, Mail, Shield, Award } from "lucide-react";
import { useShopSettings } from "@/hooks/useShopSettings";

const Footer = () => {
  const { getSetting } = useShopSettings();

  const storeName = getSetting("store_name", "Tạp Hóa Review");
  const footerAbout = getSetting(
    "footer_about",
    "Tạp Hóa Review là trang chuyên đánh giá, trải nghiệm và giới thiệu các sản phẩm gia dụng, công nghệ, nhà cửa đời sống tốt nhất. Chúng tôi giúp bạn đưa ra lựa chọn mua sắm đúng đắn nhất thông qua các đánh giá khách quan và đường link mua sắm affiliate uy tín."
  );
  const contactEmail = getSetting("contact_email", "contact@taphoareview.com");
  const contactPhone = getSetting("contact_phone", "0987 654 321");
  const contactAddress = getSetting(
    "contact_address",
    "195 Điện Biên Phủ, Phường 15, Quận Bình Thạnh, TP. Hồ Chí Minh"
  );
  const footerCopyright = getSetting(
    "footer_copyright",
    "© 2026 Tạp Hóa Review. Tất cả quyền được bảo lưu."
  );

  return (
    <footer className="relative bg-gradient-to-b from-[#0A0A0A] to-[#111111] border-t border-white/5">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FE2C55] to-transparent opacity-60"></div>

      {/* Section 1: About Us */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            {storeName}
          </h3>
        </div>
        <p className="text-[13px] leading-relaxed text-white/50">
          {footerAbout}
        </p>

        {/* Trust Badges */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#FE2C55]/70" />
            <span className="text-[11px] text-white/40 font-medium">Chính hãng</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#FE2C55]/70" />
            <span className="text-[11px] text-white/40 font-medium">Bảo hành</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      {/* Section 2: Address & Contact */}
      <div className="px-5 pt-6 pb-6">
        <h3 className="text-base font-bold text-white mb-4 tracking-tight">Địa chỉ & Liên hệ</h3>

        <div className="space-y-3">
          {/* Address */}
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <MapPin className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                 Việt Nam
              </span>
              <p className="text-[13px] text-white/60 mt-0.5">{contactAddress}</p>
            </div>
          </div>

          {/* Hotlines */}
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <Phone className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div className="space-y-1">
              <a
                href={`tel:${contactPhone}`}
                className="flex items-center gap-2 text-[13px] text-white/60 hover:text-[#FE2C55] transition-colors"
              >
                <span className="text-[11px] text-white/30 font-medium w-16">Hotline</span>
                {contactPhone}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <Mail className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                Email
              </span>
              <a
                href={`mailto:${contactEmail}`}
                className="block text-[13px] text-white/60 hover:text-[#FE2C55] transition-colors mt-0.5 break-all"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-5 pt-4 pb-24 bg-black/30 border-t border-white/5">
        <p className="text-[11px] text-white/25 text-center">
          {footerCopyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
