import React from 'react';
import { Gift, ShieldCheck, Wrench, Clock } from 'lucide-react';

export default function QuickFeatures() {
  const features = [
    {
      icon: <Gift className="text-red-600" size={28} />,
      title: "Quà tặng kèm",
      desc: "Với các hóa đơn trên 199K",
      bgClass: "bg-red-50"
    },
    {
      icon: <ShieldCheck className="text-orange-600" size={28} />,
      title: "Chính sách",
      desc: "Trải nghiệm sản phẩm miễn phí",
      bgClass: "bg-orange-50"
    },
    {
      icon: <Wrench className="text-yellow-600" size={28} />,
      title: "Bảo hành",
      desc: "Trong toàn bộ thời gian của gói",
      bgClass: "bg-yellow-50"
    },
    {
      icon: <Clock className="text-green-600" size={28} />,
      title: "Hỗ trợ 24/7",
      desc: "Qua Hotline, Fanpage, Zalo",
      bgClass: "bg-green-50"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((item, index) => (
          <div key={index} className={`${item.bgClass} rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-transform hover:-translate-y-1`}>
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-xs sm:text-sm">{item.title}</h4>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 leading-tight">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
