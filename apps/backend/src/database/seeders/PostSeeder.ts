import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Topic } from '../entities/topic.entity';
import { Tag } from '../entities/tag.entity';
import slugify from 'slugify';

export class PostSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Get admin user as author
    const admin = await em.findOne(User, { email: process.env.EMAIL_ADMIN });
    if (!admin) {
      console.log('- Admin user not found, skipping post seeding');
      return;
    }

    // Ensure Topics exist
    const danhGia = await this.getOrCreateTopic(em, 'Đánh Giá Chi Tiết', 'Review chi tiet san pham');
    const doGiaDung = await this.getOrCreateTopic(em, 'Đồ Gia Dụng', 'Review thiet bi gia dung');
    const thietBiDienTu = await this.getOrCreateTopic(em, 'Thiết Bị Điện Tử', 'Review do dien tu');
    const topList = await this.getOrCreateTopic(em, 'Top Sản Phẩm', 'Bieu xep hang san pham');
    const kinhNghiem = await this.getOrCreateTopic(em, 'Kinh Nghiệm Mua Sắm', 'Cẩm nang mua sắm');
    const meoSanSale = await this.getOrCreateTopic(em, 'Mẹo Săn Sale', 'San sale gia re');

    // Ensure Tags exist
    const robotTag = await this.getOrCreateTag(em, 'robot-hut-bui');
    const chairTag = await this.getOrCreateTag(em, 'ghe-cong-thai-hoc');
    const smartHomeTag = await this.getOrCreateTag(em, 'smart-home');
    const keyboardTag = await this.getOrCreateTag(em, 'ban-phim-co');
    const saleTag = await this.getOrCreateTag(em, 'san-sale');

    // Create sample posts
    await this.createPost(em, {
      title: 'Đánh giá Robot hút bụi Ecovacs Deebot T20 Omni: Giặt giẻ nước nóng 55°C có thực sự thần thánh?',
      thumbnail: 'https://images.unsplash.com/photo-1563161402-841447269d58?w=800',
      excerpt: 'Đánh giá thực tế robot hút bụi lau nhà Ecovacs Deebot T20 Omni sau 3 tháng sử dụng liên tục trong căn hộ chung cư 85m2.',
      content: `### Giới thiệu chung về Ecovacs Deebot T20 Omni
Ecovacs Deebot T20 Omni là một trong những sản phẩm robot hút bụi lau nhà cận cao cấp thu hút sự chú ý nhiều nhất thời gian qua. Điểm nhấn lớn nhất của dòng sản phẩm này chính là **trạm sạc đa năng tích hợp giặt giẻ lau bằng nước nóng 55°C** cùng công nghệ nâng giẻ tự động thông minh.

### Trải nghiệm thực tế sau 3 tháng
1. **Lực hút cực mạnh 6000Pa:** Hút sạch từ bụi mịn, lông thú cưng cho đến các hạt cát nhỏ ở kẽ sàn gỗ.
2. **Công nghệ giặt giẻ bằng nước nóng 55°C:** Đây là một "game-changer" thực sự. Nước nóng giúp làm tan các vết dầu mỡ, vết thức ăn rơi vãi bám chặt trên giẻ nhanh chóng hơn nhiều so với nước lạnh thông thường, hạn chế tối đa mùi hôi và nấm mốc.
3. **Nâng giẻ tự động khi gặp thảm:** Khi phát hiện thảm sàn, robot sẽ tự động nâng giẻ lau lên 9mm để hút bụi trên thảm mà không làm ướt thảm.

### Ưu điểm & Nhược điểm
* **Ưu điểm:**
  * Khả năng giặt và sấy khô giẻ lau cực tốt, giẻ không bị hôi.
  * Lực hút lớn, làm sạch sâu.
  * Bản đồ 3D dựng rất nhanh và chính xác.
* **Nhược điểm:**
  * Trạm sạc khá to và chiếm diện tích.
  * Giá thành tương đối cao nhưng hoàn toàn xứng đáng với giá trị mang lại.

### Đánh giá chung
Nếu bạn đang tìm kiếm một giải pháp giải phóng hoàn toàn sức lao động cho việc quét dọn nhà cửa hàng ngày, Ecovacs Deebot T20 Omni là một lựa chọn cực kỳ sáng giá.`,
      author: admin,
      topics: [danhGia, doGiaDung],
      tags: [robotTag, smartHomeTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    });

    await this.createPost(em, {
      title: 'Top 5 Ghế Công Thái Học Chống Đau Lưng Đáng Mua Nhất Cho Coder & Dân Văn Phòng',
      thumbnail: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800',
      excerpt: 'Tổng hợp danh sách 5 mẫu ghế công thái học (Ergonomic chair) hỗ trợ tư thế ngồi tốt nhất hiện nay trong tầm giá từ 3 triệu đến 10 triệu đồng.',
      content: `### Tại sao nên dùng Ghế Công Thái Học?
Đối với các coder, designer hoặc dân văn phòng phải ngồi làm việc từ 8-10 tiếng mỗi ngày, đau mỏi vai gáy và thắt lưng là triệu chứng không thể tránh khỏi. Ghế công thái học được thiết kế đặc biệt để ôm sát và hỗ trợ toàn bộ các điểm tì của cột sống, giúp duy trì tư thế ngồi khoa học và giảm áp lực lên các đĩa đệm.

### Danh sách Top 5 ghế đáng mua nhất năm 2026:
1. **Sihoo M57 (Tầm giá 3 triệu):** Mẫu ghế quốc dân tốt nhất cho người mới bắt đầu. Toàn bộ đệm và tựa lưng làm từ lưới thông thoáng, tựa tay 3D linh hoạt.
2. **Sihoo V1 (Tầm giá 7 triệu):** Thiết kế đệm lưng kép nâng đỡ thắt lưng vượt trội, tích hợp tựa đầu và giá kê chân thư giãn.
3. **Dvary Butterfly (Tầm giá 12 triệu):** Thiết kế cánh bướm nghệ thuật ôm sát cột sống, khung nhôm nguyên khối siêu chắc chắn.
4. **Epione EasyChair (Tầm giá 6 triệu):** Thương hiệu Việt Nam thiết kế tối giản, hỗ trợ tựa tay 3D và cơ chế ngả lưng 135 độ êm ái.
5. **Herman Miller Aeron (Phân khúc cao cấp - Trên 30 triệu):** Biểu tượng của ghế công thái học thế giới. Độ bền lên tới 12 năm, thiết kế ôm chuẩn chỉnh từng đốt sống.

### Lựa chọn khuyên dùng
Nếu bạn muốn một chiếc ghế ngon - bổ - rẻ đáp ứng 90% nhu cầu bảo vệ cột sống, hãy bắt đầu ngay với **Sihoo M57**. Ghế có độ bền lưới rất cao và điều chỉnh được tựa thắt lưng linh hoạt.`,
      author: admin,
      topics: [topList],
      tags: [chairTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });

    await this.createPost(em, {
      title: 'Cẩm nang hướng dẫn cách săn voucher giảm giá sâu Shopee, Lazada ngày đôi',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      excerpt: 'Mách bạn các mẹo căn giờ, lấy mã giảm giá cực khủng của các sàn thương mại điện tử vào các đợt siêu sale 8/8, 9/9, 10/10.',
      content: `### Các loại mã giảm giá phổ biến trên Shopee / Lazada
Để có được một đơn hàng giá "hời" nhất, bạn cần biết cách kết hợp (stack) nhiều tầng mã voucher trên các sàn:
1. **Mã miễn phí vận chuyển (Freeship):** Thường do sàn cấp trực tiếp, áp dụng cho mọi đơn hàng từ các shop đủ điều kiện.
2. **Voucher của Sàn (Shopee/Lazada):** Mã giảm giá trực tiếp theo số tiền (ví dụ: Giảm 50k cho đơn 250k) hoặc hoàn xu.
3. **Voucher của Shop:** Mã do các nhà bán hàng tự tạo ra để thu hút khách hàng.
4. **Mã từ đối tác thanh toán:** Ưu đãi từ ngân hàng hoặc ví điện tử (ShopeePay, ZaloPay, Momo).

### Các bước săn sale hiệu quả nhất
* **Bước 1: Cho trước sản phẩm vào giỏ hàng.** Trước ngày sale ít nhất 1-2 ngày, hãy lựa chọn đúng phiên bản sản phẩm mong muốn để tránh việc hết hàng khi vừa mở bán.
* **Bước 2: Căn giờ vàng.** Các khung giờ 0H, 9H, 12H, 15H, 18H, 21H là thời điểm vàng các sàn tung mã mới. Đặc biệt là khung **0H ngày đôi** là giờ giảm giá sâu nhất.
* **Bước 3: Tải nhanh mã giảm giá và áp dụng thanh toán thần tốc.** Sử dụng đường truyền mạng tốc độ cao (Wifi 5G hoặc mạng 4G khỏe) để tranh giật các voucher giới hạn lượt sử dụng.

Hy vọng cẩm nang ngắn này sẽ giúp bạn săn được những món đồ ưng ý nhất tại Tạp Hóa Review với giá tiết kiệm nhất!`,
      author: admin,
      topics: [kinhNghiem, meoSanSale],
      tags: [saleTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    await this.createPost(em, {
      title: 'Đánh giá bàn phím cơ Keychron K2 V2: Trải nghiệm gõ phím mượt mà cho người dùng macOS',
      thumbnail: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
      excerpt: 'Nếu bạn đang dùng Macbook và muốn tìm một chiếc bàn phím cơ kết nối không dây mượt mà nhất, Keychron K2 V2 chắc chắn phải nằm trong danh sách cân nhắc.',
      content: `### Lý do Keychron K2 V2 luôn là lựa chọn hàng đầu cho macOS
Keychron K2 V2 là chiếc bàn phím cơ layout 75% (84 phím) cực kỳ nổi tiếng. Nó giải quyết được bài toán hóc búa nhất của người dùng Mac: **tương thích hoàn hảo với hệ điều hành macOS** (cung cấp đầy đủ cụm phím chức năng media như tăng giảm độ sáng màn hình, âm lượng, launchpad).

### Điểm cải tiến của bản V2
1. **Thiết kế vát cạnh tiện lợi:** Giúp tay gõ phím tự nhiên hơn, bớt mỏi cổ tay so với bản V1 quá dày.
2. **Khung nhôm chắc chắn:** Mang lại trọng lượng đầm chắc, âm thanh gõ trầm và ít rung động.
3. **Kết nối Bluetooth 5.1:** Cho kết nối xa hơn, độ trễ thấp và chuyển đổi cực nhanh giữa 3 thiết bị đồng thời.

### Trải nghiệm gõ phím thực tế
Gateron Switch trên Keychron K2 V2 cho cảm giác gõ rất mượt mà. Lớp đệm cao su và feet nâng độ dốc phím 2 cấp độ giúp bạn làm việc cả ngày mà không bị mỏi cổ tay.

### Kết luận
Keychron K2 V2 vẫn xứng đáng là "ông vua bàn phím cơ phân khúc nhập môn" dành cho người dùng Macbook. Sự tương thích tuyệt đối và thiết kế chỉn chu là điểm cộng lớn nhất của dòng sản phẩm này.`,
      author: admin,
      topics: [danhGia, thietBiDienTu],
      tags: [keyboardTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    });

    await em.flush();
    console.log('✓ Tạp Hóa Review Posts seeded successfully');
  }

  private async getOrCreateTopic(em: EntityManager, name: string, description: string): Promise<Topic> {
    const existing = await em.findOne(Topic, { name });
    if (existing) return existing;

    const topic = em.create(Topic, {
      name,
      slug: slugify(name, { lower: true }),
      description,
      level: 0,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(topic);
    return topic;
  }

  private async getOrCreateTag(em: EntityManager, name: string): Promise<Tag> {
    const existing = await em.findOne(Tag, { name });
    if (existing) return existing;

    const tag = em.create(Tag, {
      name,
      slug: slugify(name, { lower: true }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(tag);
    return tag;
  }

  private async createPost(
    em: EntityManager,
    data: {
      title: string;
      thumbnail: string;
      excerpt: string;
      content: string;
      author: User;
      topics: Topic[];
      tags: Tag[];
      isPublished: boolean;
      publishedAt: Date;
    },
  ): Promise<Post> {
    const existing = await em.findOne(Post, { title: data.title });
    if (existing) {
      existing.thumbnail = data.thumbnail;
      existing.excerpt = data.excerpt;
      existing.content = data.content;
      existing.isPublished = data.isPublished;
      existing.publishedAt = data.publishedAt;
      console.log(`- Updated existing post: ${data.title}`);
      return existing;
    }

    const post = em.create(Post, {
      title: data.title,
      slug: '', 
      thumbnail: data.thumbnail,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      isActive: true,
      isPublished: data.isPublished,
      publishedAt: data.publishedAt,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const topic of data.topics) post.topics.add(topic);
    for (const tag of data.tags) post.tags.add(tag);

    em.persist(post);
    console.log(`✓ Created post: ${data.title}`);
    return post;
  }
}
