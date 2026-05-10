import { ApiProperty } from '@nestjs/swagger';

export class OverviewCardDto {
  @ApiProperty({ description: 'Giá trị thống kê', example: 125000000 })
  value: number;

  @ApiProperty({ description: 'Phần trăm thay đổi so với kỳ trước', example: 12.5 })
  percentChange: number;

  @ApiProperty({ description: 'Xu hướng tăng/giảm', enum: ['up', 'down'], example: 'up' })
  trend: 'up' | 'down';
}

export class RevenueByMonthItemDto {
  @ApiProperty({ description: 'Tháng (YYYY-MM)', example: '2026-03' })
  month: string;

  @ApiProperty({ description: 'Doanh thu', example: 125000000 })
  revenue: number;
}

export class OrdersByDayItemDto {
  @ApiProperty({ description: 'Ngày (YYYY-MM-DD)', example: '2026-03-25' })
  date: string;

  @ApiProperty({ description: 'Số đơn hàng', example: 45 })
  count: number;
}

export class CategoryDistributionItemDto {
  @ApiProperty({ description: 'Tên danh mục', example: 'Dụng cụ pin' })
  name: string;

  @ApiProperty({ description: 'Số sản phẩm', example: 15 })
  count: number;
}

export class TopSellingProductItemDto {
  @ApiProperty({ description: 'ID sản phẩm', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tên sản phẩm', example: 'Máy khoan pin Hukan' })
  name: string;

  @ApiProperty({ description: 'Số lượng đã bán', example: 124 })
  soldCount: number;

  @ApiProperty({ description: 'Doanh thu', example: 55600000 })
  revenue: number;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: OverviewCardDto })
  revenue: OverviewCardDto;

  @ApiProperty({ type: OverviewCardDto })
  newOrders: OverviewCardDto;

  @ApiProperty({ type: OverviewCardDto })
  visits: OverviewCardDto;

  @ApiProperty({ type: OverviewCardDto })
  newCustomers: OverviewCardDto;

  @ApiProperty({ type: [RevenueByMonthItemDto] })
  revenueByMonth: RevenueByMonthItemDto[];

  @ApiProperty({ type: [OrdersByDayItemDto] })
  ordersByDay: OrdersByDayItemDto[];

  @ApiProperty({ type: [CategoryDistributionItemDto] })
  categoryDistribution: CategoryDistributionItemDto[];

  @ApiProperty({ type: [TopSellingProductItemDto] })
  topSellingProducts: TopSellingProductItemDto[];
}
