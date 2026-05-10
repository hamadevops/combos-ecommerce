export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export const mockFaqs: FAQ[] = [
  {
    id: "1",
    question: "Làm thế nào để đặt hàng?",
    answer:
      "Bạn có thể đặt hàng trực tiếp trên website bằng cách thêm sản phẩm vào giỏ hàng và tiến hành thanh toán.",
    order: 1,
    isActive: true,
  },
  {
    id: "2",
    question: "Thời gian giao hàng là bao lâu?",
    answer: "Thời gian giao hàng thường từ 2-4 ngày làm việc tùy vào vị trí của bạn.",
    order: 2,
    isActive: true,
  },
  {
    id: "3",
    question: "Tôi có thể đổi trả hàng không?",
    answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất.",
    order: 3,
    isActive: true,
  },
  {
    id: "4",
    question: "Phí vận chuyển được tính như thế nào?",
    answer: "Phí vận chuyển được tính dựa trên trọng lượng đơn hàng và địa chỉ giao hàng.",
    order: 4,
    isActive: true,
  },
];
