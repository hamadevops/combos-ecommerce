import { Loader2 } from "lucide-react";
import Link from "next/link";


export interface AboutUsProps {
  title?: string;
  content?: string;
  isLoading?: boolean;
}

export default function AboutUs({
  title = "Giới thiệu về chúng tôi",
  content = `<p>Chào mừng bạn đến với <strong>MuaTaiKhoanOnline.com</strong> - Nền tảng chuyên cung cấp các loại tài khoản cao cấp, phần mềm bản quyền, và các công cụ hỗ trợ công việc, giải trí hàng đầu Việt Nam.</p>
  <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Tầm nhìn và Sứ mệnh</h3>
  <p>Với mong muốn mang đến cho người dùng Việt Nam cơ hội tiếp cận và sử dụng các dịch vụ số chất lượng cao với chi phí hợp lý nhất, chúng tôi không ngừng nỗ lực tìm kiếm và cung cấp những sản phẩm tốt nhất.</p>
  <p>Sứ mệnh của chúng tôi là trở thành cầu nối đáng tin cậy giữa người dùng và các nhà cung cấp dịch vụ toàn cầu, giúp tối ưu hóa ngân sách mà vẫn đảm bảo trải nghiệm trọn vẹn nhất.</p>
  <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Cam kết chất lượng</h3>
  <ul class="list-disc pl-6 space-y-2">
    <li><strong>Chính hãng 100%:</strong> Mọi tài khoản và phần mềm đều được cung cấp rõ ràng nguồn gốc, đảm bảo tính hợp pháp.</li>
    <li><strong>Bảo hành uy tín:</strong> Chế độ bảo hành linh hoạt, 1 đổi 1 hoặc hoàn tiền nếu xảy ra lỗi trong quá trình sử dụng.</li>
    <li><strong>Hỗ trợ tận tâm:</strong> Đội ngũ kỹ thuật viên luôn túc trực 24/7 để giải đáp mọi thắc mắc và hỗ trợ cài đặt nhanh chóng.</li>
  </ul>
  <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Tại sao chọn chúng tôi?</h3>
  <p>Chúng tôi hiểu rằng sự tin tưởng của khách hàng là tài sản quý giá nhất. Vì vậy, mọi giao dịch tại <strong>MuaTaiKhoanOnline.com</strong> đều được mã hóa bảo mật tuyệt đối. Hàng ngàn khách hàng đã trải nghiệm và hài lòng với dịch vụ của chúng tôi, và chúng tôi mong bạn sẽ là người tiếp theo!</p>`,
  isLoading = false
}: AboutUsProps) {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 lg:p-12 rounded-2xl shadow-sm">
        
        {/* Breadcrumbs */}
        <nav className="flex text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Giới thiệu</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 uppercase border-b-2 border-red-600 pb-4 inline-block">
          {title}
        </h1>

        {/* Content */}
        <div className="prose max-w-none text-gray-700 leading-relaxed">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>

      </div>
    </div>
  );
}

