export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  tags: string[];
  tableOfContents: {
    id: string;
    title: string;
    level: number;
  }[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "10 Xu hướng thời trang Xuân Hè 2024 bạn không thể bỏ qua",
    slug: "xu-huong-thoi-trang-xuan-he-2024",
    excerpt:
      "Khám phá những xu hướng thời trang nổi bật nhất mùa Xuân Hè năm nay, từ màu sắc pastel nhẹ nhàng đến những thiết kế phá cách táo bạo.",
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1200",
    category: "Xu hướng",
    date: "15 Tháng 3, 2024",
    readTime: "5 phút đọc",
    author: {
      name: "Minh Anh",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      bio: "Fashion Editor với 8 năm kinh nghiệm trong ngành thời trang. Đam mê khám phá xu hướng và chia sẻ bí quyết phối đồ.",
    },
    tags: ["Xu hướng", "Xuân Hè", "Thời trang 2024", "Phối đồ"],
    tableOfContents: [
      { id: "gioi-thieu", title: "Giới thiệu về xu hướng Xuân Hè 2024", level: 1 },
      { id: "mau-pastel", title: "Màu sắc Pastel thống trị", level: 1 },
      { id: "cach-phoi", title: "Cách phối màu pastel hiệu quả", level: 2 },
      { id: "cut-out", title: "Thiết kế Cut-out táo bạo", level: 1 },
      { id: "sustainable", title: "Thời trang bền vững", level: 1 },
      { id: "oversized", title: "Oversized vẫn lên ngôi", level: 1 },
      { id: "phu-kien", title: "Phụ kiện statement", level: 1 },
      { id: "ket-luan", title: "Kết luận", level: 1 },
    ],
    content: `
## Giới thiệu về xu hướng Xuân Hè 2024 {#gioi-thieu}

Mùa Xuân Hè 2024 đánh dấu sự trở lại mạnh mẽ của những gam màu tươi sáng và các thiết kế phá cách. Các nhà mốt hàng đầu thế giới đã đưa ra những bộ sưu tập đậm chất nghệ thuật, kết hợp giữa sự thanh lịch cổ điển và tinh thần hiện đại.

Từ những sàn diễn Paris, Milan đến New York, chúng ta có thể thấy rõ một số xu hướng chủ đạo sẽ định hình phong cách thời trang trong năm nay. Hãy cùng khám phá chi tiết từng xu hướng để bạn có thể cập nhật cho tủ đồ của mình.

![Fashion Week 2024](https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000)

## Màu sắc Pastel thống trị {#mau-pastel}

Pastel không còn chỉ dành cho mùa xuân nữa - năm nay, các tông màu nhẹ nhàng như lavender, mint green, baby blue và soft pink sẽ xuất hiện xuyên suốt các mùa. Đây là những màu sắc mang lại cảm giác nhẹ nhàng, nữ tính nhưng vẫn đầy phong cách.

**Các màu pastel hot nhất:**
- **Lavender Haze**: Màu tím oải hương nhẹ nhàng, thanh lịch
- **Soft Sage**: Xanh bạc hà dịu mát, gợi cảm giác tươi mới
- **Butter Yellow**: Vàng bơ ấm áp, tươi sáng
- **Powder Pink**: Hồng phấn ngọt ngào, nữ tính

### Cách phối màu pastel hiệu quả {#cach-phoi}

Để phối pastel không bị "sến", bạn có thể áp dụng các công thức sau:

1. **Pastel + Trắng**: Công thức an toàn, luôn đúng
2. **Pastel + Pastel**: Chọn 2 màu trong cùng tông hoặc tương phản nhẹ
3. **Pastel + Đen**: Tạo điểm nhấn, hiện đại hơn
4. **Color blocking**: Kết hợp các block màu pastel lớn

> "Pastel là cách tuyệt vời để làm mềm mại diện mạo mà không cần quá cầu kỳ" - Anna Wintour

## Thiết kế Cut-out táo bạo {#cut-out}

Cut-out tiếp tục là xu hướng nổi bật với những đường cắt xẻ tinh tế ở vai, eo, hoặc lưng. Xu hướng này mang lại vẻ gợi cảm vừa đủ mà vẫn thanh lịch.

**Các kiểu cut-out phổ biến:**
- Cut-out vai: Phù hợp với áo, đầm
- Cut-out eo: Tôn vóc dáng
- Cut-out lưng: Sexy nhưng tinh tế
- Cut-out geometric: Hình học độc đáo

![Cut-out fashion](https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000)

## Thời trang bền vững {#sustainable}

Sustainable fashion không chỉ là xu hướng mà đã trở thành lối sống. Các thương hiệu lớn đang chuyển dịch mạnh mẽ sang sử dụng chất liệu thân thiện môi trường:

| Chất liệu | Ưu điểm | Ứng dụng |
|-----------|---------|----------|
| Organic Cotton | Không thuốc trừ sâu | Áo, quần |
| Recycled Polyester | Tái chế nhựa | Áo khoác, túi |
| Tencel | Phân hủy sinh học | Váy, áo |
| Hemp | Bền, thoáng khí | Jeans, áo |

## Oversized vẫn lên ngôi {#oversized}

Phom dáng oversized tiếp tục được ưa chuộng nhờ sự thoải mái và phong cách effortless chic. Từ blazer, áo sơ mi đến quần ống rộng - tất cả đều được phóng đại kích thước.

**Tips phối đồ oversized:**
- Balance với item ôm body
- Cuộn tay áo tạo điểm nhấn
- Thắt lưng ngang eo với đầm/áo oversized
- Layer nhiều lớp oversized có độ dài khác nhau

## Phụ kiện statement {#phu-kien}

Phụ kiện năm nay thiên về to bản, eye-catching:

- **Túi xách**: Oversized tote, clutch cứng cáp
- **Trang sức**: Chunky chain, ear cuff, statement ring
- **Kính mát**: Mắt to, frame đậm
- **Giày**: Platform, kitten heels trở lại

## Kết luận {#ket-luan}

Xu hướng Xuân Hè 2024 mang đến sự đa dạng và tự do trong phong cách. Điều quan trọng nhất là bạn chọn những gì phù hợp với cá tính và lối sống của mình. Hãy thử nghiệm, mix & match và tạo nên phong cách riêng của bản thân!

Đừng quên follow blog của chúng tôi để cập nhật những xu hướng mới nhất nhé!
    `,
  },
  {
    id: "2",
    title: "Cách phối đồ công sở đẹp và chuyên nghiệp",
    slug: "cach-phoi-do-cong-so",
    excerpt:
      "Bí quyết mix & match trang phục công sở giúp bạn tự tin và nổi bật tại nơi làm việc mà vẫn giữ được sự thanh lịch.",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200",
    category: "Phong cách",
    date: "10 Tháng 3, 2024",
    readTime: "4 phút đọc",
    author: {
      name: "Thu Hà",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      bio: "Stylist chuyên nghiệp, tư vấn hình ảnh cho nhiều doanh nhân và người nổi tiếng.",
    },
    tags: ["Công sở", "Phối đồ", "Chuyên nghiệp", "Office wear"],
    tableOfContents: [
      { id: "nguyen-tac", title: "Nguyên tắc cơ bản", level: 1 },
      { id: "mau-sac", title: "Lựa chọn màu sắc", level: 1 },
      { id: "chat-lieu", title: "Chất liệu phù hợp", level: 1 },
      { id: "phu-kien", title: "Phụ kiện điểm nhấn", level: 1 },
      { id: "loi-nen-tranh", title: "Những lỗi nên tránh", level: 1 },
    ],
    content: `
## Nguyên tắc cơ bản {#nguyen-tac}

Trang phục công sở cần đáp ứng 3 tiêu chí quan trọng: **Chuyên nghiệp**, **Thoải mái** và **Phù hợp văn hóa công ty**.

Mỗi ngành nghề sẽ có dress code khác nhau. Ngành tài chính, luật thường yêu cầu formal hơn trong khi các công ty startup, creative có thể thoải mái hơn.

## Lựa chọn màu sắc {#mau-sac}

Các màu trung tính là lựa chọn an toàn:
- Đen, trắng, xám
- Navy, beige, camel
- Burgundy, forest green

## Chất liệu phù hợp {#chat-lieu}

Ưu tiên các chất liệu cao cấp, ít nhăn:
- Cotton poplin
- Wool blend
- Silk
- Linen (phù hợp mùa hè)

## Phụ kiện điểm nhấn {#phu-kien}

Phụ kiện giúp outfit công sở không nhàm chán:
- Đồng hồ thanh lịch
- Túi xách da
- Giày cao gót hoặc loafer
- Kính mắt tinh tế

## Những lỗi nên tránh {#loi-nen-tranh}

- Quần áo quá chật hoặc quá rộng
- Màu sắc quá sặc sỡ
- Phụ kiện lòe loẹt
- Váy/quần quá ngắn
    `,
  },
  {
    id: "3",
    title: "Hướng dẫn chọn size quần áo chuẩn nhất",
    slug: "huong-dan-chon-size",
    excerpt:
      "Tất tần tật về cách đo size và chọn quần áo phù hợp với vóc dáng của bạn. Không còn lo mua đồ online sai size.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
    category: "Hướng dẫn",
    date: "5 Tháng 3, 2024",
    readTime: "6 phút đọc",
    author: {
      name: "Đức Minh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      bio: "Chuyên gia tư vấn thời trang nam, người sáng lập StyleMen Vietnam.",
    },
    tags: ["Hướng dẫn", "Size", "Mua sắm online", "Tips"],
    tableOfContents: [
      { id: "cach-do", title: "Cách đo số đo cơ thể", level: 1 },
      { id: "bang-size", title: "Bảng quy đổi size", level: 1 },
      { id: "luu-y", title: "Lưu ý khi mua online", level: 1 },
    ],
    content: `
## Cách đo số đo cơ thể {#cach-do}

Để chọn size chính xác, bạn cần biết các số đo cơ bản của mình:

1. **Vòng ngực**: Đo vòng quanh phần đầy nhất của ngực
2. **Vòng eo**: Đo vòng quanh phần nhỏ nhất của eo
3. **Vòng hông**: Đo vòng quanh phần đầy nhất của hông
4. **Chiều dài chân**: Đo từ đáy quần đến mắt cá

## Bảng quy đổi size {#bang-size}

| Size | Vòng ngực | Vòng eo | Vòng hông |
|------|-----------|---------|-----------|
| S    | 86-90cm   | 68-72cm | 90-94cm   |
| M    | 90-94cm   | 72-76cm | 94-98cm   |
| L    | 94-98cm   | 76-80cm | 98-102cm  |
| XL   | 98-102cm  | 80-84cm | 102-106cm |

## Lưu ý khi mua online {#luu-y}

- Luôn xem bảng size của từng thương hiệu
- Đọc review của người mua trước
- Chọn shop có chính sách đổi trả
- Hỏi shop về chi tiết số đo sản phẩm
    `,
  },
  {
    id: "4",
    title: "Bí quyết bảo quản quần áo bền đẹp như mới",
    slug: "bao-quan-quan-ao",
    excerpt:
      "Những mẹo đơn giản giúp quần áo của bạn luôn giữ được form dáng và màu sắc như ngày đầu mua.",
    image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=1200",
    category: "Mẹo hay",
    date: "1 Tháng 3, 2024",
    readTime: "4 phút đọc",
    author: {
      name: "Lan Phương",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      bio: "Blogger lifestyle, chia sẻ mẹo sống xanh và bền vững.",
    },
    tags: ["Mẹo hay", "Bảo quản", "Giặt ủi", "Tips"],
    tableOfContents: [
      { id: "giat-dung-cach", title: "Giặt đúng cách", level: 1 },
      { id: "phoi-ui", title: "Phơi và ủi", level: 1 },
      { id: "bao-quan", title: "Cất giữ quần áo", level: 1 },
    ],
    content: `
## Giặt đúng cách {#giat-dung-cach}

- Phân loại quần áo theo màu và chất liệu
- Lộn trái áo có hình in
- Sử dụng túi giặt cho đồ lót và vải mỏng
- Không giặt nước quá nóng

## Phơi và ủi {#phoi-ui}

- Phơi trong bóng râm để giữ màu
- Ủi từ nhiệt độ thấp lên cao
- Sử dụng xịt ủi để quần áo phẳng hơn

## Cất giữ quần áo {#bao-quan}

- Dùng móc phù hợp với loại áo
- Gấp gọn gàng với quần jeans
- Bảo quản trong tủ khô ráo
- Sử dụng túi chống ẩm
    `,
  },
  {
    id: "5",
    title: "Street style: Phong cách đường phố thu hút mọi ánh nhìn",
    slug: "street-style-2024",
    excerpt:
      "Cập nhật những set đồ street style hot nhất đang được các fashionista săn đón trong mùa này.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200",
    category: "Street Style",
    date: "25 Tháng 2, 2024",
    readTime: "5 phút đọc",
    author: {
      name: "Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      bio: "Photographer và street style hunter, săn lùng những outfit độc đáo trên phố.",
    },
    tags: ["Street Style", "Urban", "Streetwear", "Trend"],
    tableOfContents: [
      { id: "dinh-nghia", title: "Street style là gì?", level: 1 },
      { id: "item-can-co", title: "Những item must-have", level: 1 },
      { id: "cach-phoi", title: "Công thức phối đồ", level: 1 },
    ],
    content: `
## Street style là gì? {#dinh-nghia}

Street style hay thời trang đường phố là phong cách thời trang xuất phát từ văn hóa đường phố, không bị ràng buộc bởi các quy tắc truyền thống.

## Những item must-have {#item-can-co}

- Sneakers chunky
- Áo hoodie oversized
- Quần cargo
- Túi crossbody
- Kính mát to bản
- Bomber jacket

## Công thức phối đồ {#cach-phoi}

1. **Sporty**: Hoodie + Track pants + Sneakers
2. **Urban**: Graphic tee + Cargo + High-top
3. **Minimalist**: Neutral colors + Clean lines
4. **Y2K vibes**: Low-rise + Crop top + Platform
    `,
  },
  {
    id: "6",
    title: "Cách chọn túi xách phù hợp với outfit",
    slug: "chon-tui-xach-phu-hop",
    excerpt:
      "Hướng dẫn chi tiết cách mix match túi xách với trang phục để tạo nên vẻ ngoài hoàn hảo.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200",
    category: "Phụ kiện",
    date: "20 Tháng 2, 2024",
    readTime: "3 phút đọc",
    author: {
      name: "Minh Anh",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      bio: "Fashion Editor với 8 năm kinh nghiệm trong ngành thời trang.",
    },
    tags: ["Phụ kiện", "Túi xách", "Phối đồ", "Accessories"],
    tableOfContents: [
      { id: "loai-tui", title: "Các loại túi xách phổ biến", level: 1 },
      { id: "phoi-theo-dip", title: "Phối túi theo từng dịp", level: 1 },
      { id: "chon-mau", title: "Lựa chọn màu sắc", level: 1 },
    ],
    content: `
## Các loại túi xách phổ biến {#loai-tui}

- **Tote bag**: Đựng được nhiều đồ, phù hợp đi làm
- **Crossbody**: Tiện dụng, năng động
- **Clutch**: Sang trọng, phù hợp dự tiệc
- **Backpack**: Sporty, trẻ trung
- **Shoulder bag**: Classic, thanh lịch

## Phối túi theo từng dịp {#phoi-theo-dip}

| Dịp | Loại túi phù hợp |
|-----|------------------|
| Đi làm | Tote, Shoulder bag |
| Dạo phố | Crossbody, Backpack |
| Dự tiệc | Clutch, Mini bag |
| Du lịch | Tote, Backpack |

## Lựa chọn màu sắc {#chon-mau}

Màu trung tính (đen, nâu, be) dễ phối nhất và có thể dùng cho nhiều outfit khác nhau.
    `,
  },
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, category: string): BlogPost[] => {
  return blogPosts
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, 3);
};

export const getLatestPosts = (excludeSlug?: string): BlogPost[] => {
  return blogPosts.filter((post) => post.slug !== excludeSlug).slice(0, 5);
};
