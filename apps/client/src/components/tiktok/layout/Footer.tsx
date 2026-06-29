import { MapPin, Phone, Mail, Shield, Award, Headphones } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-[#0A0A0A] to-[#111111] border-t border-white/5">
      {/* Top Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FE2C55] to-transparent opacity-60"></div>

      {/* Section 1: About Us */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU BẮC NINH
          </h3>
        </div>
        <p className="text-[13px] leading-relaxed text-white/50">
          Cửa hàng chuyên phân phối dụng cụ chính hãng chuyên nghiệp, uy tín. Với nhiều năm kinh
          nghiệm trong ngành, chúng tôi đã khẳng định được uy tín của mình thông qua việc cung cấp
          sản phẩm chất lượng, luôn đảm bảo quyền lợi khách hàng và khâu bảo hành hàng đầu.
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
          {/* Address Hanoi */}
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <MapPin className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                 Việt Nam
              </span>
              <p className="text-[13px] text-white/60 mt-0.5">20 đường Nguyễn Du, Phường Kinh Bắc, Tỉnh Bắc Ninh</p>
            </div>
          </div>

          {/* Address HCMC
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <MapPin className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                TP.HCM
              </span>
              <p className="text-[13px] text-white/60 mt-0.5">Phường 16, Quận 8, TP Hồ Chí Minh</p>
            </div>
          </div> */}

          {/* Hotlines */}
          <div className="flex items-start gap-3 group">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#FE2C55]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FE2C55]/20 transition-colors">
              <Phone className="w-4 h-4 text-[#FE2C55]" />
            </div>
            <div className="space-y-1">
              <a
                href="tel:0386616188"
                className="flex items-center gap-2 text-[13px] text-white/60 hover:text-[#FE2C55] transition-colors"
              >
                <span className="text-[11px] text-white/30 font-medium w-16">Hotline 1</span>
                0386 616 188
              </a>
              <a
                href="tel:0386996588"
                className="flex items-center gap-2 text-[13px] text-white/60 hover:text-[#FE2C55] transition-colors"
              >
                <span className="text-[11px] text-white/30 font-medium w-16">Hotline 2</span>
                0386 996 588
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
                href="mailto:Phanphoidienmaylbhntphcm@gmail.com"
                className="block text-[13px] text-white/60 hover:text-[#FE2C55] transition-colors mt-0.5 break-all"
              >
                Phanphoidienmaylbhntphcm@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-5 pt-4 pb-24 bg-black/30 border-t border-white/5">
        <p className="text-[11px] text-white/25 text-center">
          © 2026 Phân phối điện máy chính hãng.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
