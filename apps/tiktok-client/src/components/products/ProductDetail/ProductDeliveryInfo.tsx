import { Truck, Shield } from "lucide-react";

export default function ProductDeliveryInfo() {
  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-start gap-2">
          <Truck className="w-4 h-4 text-tiktok-cyan mt-1 flex-shrink-0" />
          <div className="flex-1 text-sm leading-snug">
            <span className="bg-tiktok-cyan text-black text-[10px] inline-block px-1.5 py-0.5 rounded font-medium whitespace-nowrap align-text-bottom mr-2">
              Vận chuyển
            </span>
            <span>Giao hàng nhanh chóng, uy tín đảm bảo</span>
          </div>
        </div>
      </div>
      {/* Official Warranty Banner */}
      <div className="px-4 py-3 border-b border-white/5 bg-background">
        <div className="flex items-start gap-2">
          <div className="relative mt-1">
            <div className="absolute inset-0 bg-primary/20 blur-[8px] rounded-full"></div>
            <Shield className="w-4 h-4 text-primary relative z-10 fill-primary/10" />
          </div>
          <div className="flex-1">
            <div className="text-sm leading-snug">
              <span className="bg-[#00F2EA] text-black text-[10px] inline-block px-1.5 py-0.5 rounded-[2px] font-bold tracking-tight shadow-[0_0_10px_rgba(0,242,234,0.3)] whitespace-nowrap align-text-bottom mr-2">
                Chính hãng
              </span>
              <span className="font-medium">Nhập khẩu chính ngạch</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Được kiểm tra hàng
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Nguồn gốc rõ ràng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
