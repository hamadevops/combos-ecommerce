import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardStatsResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly em: EntityManager) {}

  async getStats(query: DashboardQueryDto): Promise<DashboardStatsResponseDto> {
    const knex = (this.em as any).getKnex();

    // Parse date range
    const now = new Date();
    const endDate = query.endDate
      ? new Date(query.endDate + 'T23:59:59')
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startDate = query.startDate
      ? new Date(query.startDate + 'T00:00:00')
      : new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate previous period (same duration, immediately before)
    const durationMs = endDate.getTime() - startDate.getTime();
    const prevEndDate = new Date(startDate.getTime() - 1); // 1ms before startDate
    const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

    const startStr = this.formatDate(startDate);
    const endStr = this.formatDate(endDate);
    const prevStartStr = this.formatDate(prevStartDate);
    const prevEndStr = this.formatDate(prevEndDate);

    // Run all queries in parallel
    const [
      overviewCards,
      revenueByMonth,
      ordersByDay,
      categoryDistribution,
      topSellingProducts,
    ] = await Promise.all([
      this.getOverviewCards(knex, startStr, endStr, prevStartStr, prevEndStr),
      this.getRevenueByMonth(knex, startStr, endStr),
      this.getOrdersByDay(knex, startStr, endStr),
      this.getCategoryDistribution(knex),
      this.getTopSellingProducts(knex, 5),
    ]);

    return {
      ...overviewCards,
      revenueByMonth,
      ordersByDay,
      categoryDistribution,
      topSellingProducts,
    };
  }

  private async getOverviewCards(
    knex: any,
    startDate: string,
    endDate: string,
    prevStartDate: string,
    prevEndDate: string,
  ) {
    // 1. Revenue current period
    const [revenueCurrent] = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [startDate, endDate])
      .select(knex.raw('COALESCE(SUM(final_amount), 0) as total'));

    // 2. Revenue previous period
    const [revenuePrev] = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [prevStartDate, prevEndDate])
      .select(knex.raw('COALESCE(SUM(final_amount), 0) as total'));

    // 3. Orders count current
    const [ordersCurrent] = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [startDate, endDate])
      .select(knex.raw('COUNT(*) as total'));

    // 4. Orders count previous
    const [ordersPrev] = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [prevStartDate, prevEndDate])
      .select(knex.raw('COUNT(*) as total'));

    // 5. New customers current
    const [customersCurrent] = await knex('customers')
      .whereBetween('created_at', [startDate, endDate])
      .select(knex.raw('COUNT(*) as total'));

    // 6. New customers previous
    const [customersPrev] = await knex('customers')
      .whereBetween('created_at', [prevStartDate, prevEndDate])
      .select(knex.raw('COUNT(*) as total'));

    // 7. Page views current
    const [visitsCurrent] = await knex('page_views')
      .whereBetween('created_at', [startDate, endDate])
      .select(knex.raw('COUNT(*) as total'));

    // 8. Page views previous
    const [visitsPrev] = await knex('page_views')
      .whereBetween('created_at', [prevStartDate, prevEndDate])
      .select(knex.raw('COUNT(*) as total'));

    return {
      revenue: this.buildOverviewCard(
        Number(revenueCurrent.total),
        Number(revenuePrev.total),
      ),
      newOrders: this.buildOverviewCard(
        Number(ordersCurrent.total),
        Number(ordersPrev.total),
      ),
      visits: this.buildOverviewCard(
        Number(visitsCurrent.total),
        Number(visitsPrev.total),
      ),
      newCustomers: this.buildOverviewCard(
        Number(customersCurrent.total),
        Number(customersPrev.total),
      ),
    };
  }

  private async getRevenueByMonth(knex: any, startDate: string, endDate: string) {
    const rows = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [startDate, endDate])
      .select(
        knex.raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
        knex.raw('COALESCE(SUM(final_amount), 0) as revenue'),
      )
      .groupByRaw("DATE_FORMAT(created_at, '%Y-%m')")
      .orderByRaw("DATE_FORMAT(created_at, '%Y-%m') ASC");

    // Build a map of existing data
    const dataMap = new Map<string, number>();
    for (const row of rows) {
      dataMap.set(row.month, Number(row.revenue));
    }

    // Generate all months in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allMonths: Array<{ month: string; revenue: number }> = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      allMonths.push({ month: key, revenue: dataMap.get(key) || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return allMonths;
  }

  private async getOrdersByDay(knex: any, startDate: string, endDate: string) {
    const rows = await knex('orders')
      .where('status', '!=', 'CANCELLED')
      .whereBetween('created_at', [startDate, endDate])
      .select(
        knex.raw('DATE(created_at) as date'),
        knex.raw('COUNT(*) as count'),
      )
      .groupByRaw('DATE(created_at)')
      .orderByRaw('DATE(created_at) ASC');

    // Build a map of existing data
    const dataMap = new Map<string, number>();
    for (const row of rows) {
      dataMap.set(this.formatDateOnly(row.date), Number(row.count));
    }

    // Generate all days in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays: Array<{ date: string; count: number }> = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    while (cursor <= endDay) {
      const key = this.formatDateOnly(cursor);
      allDays.push({ date: key, count: dataMap.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return allDays;
  }

  private async getCategoryDistribution(knex: any) {
    const rows = await knex('categories as c')
      .leftJoin('product_categories as pc', 'c.id', 'pc.category_id')
      .where('c.is_active', true)
      .select('c.name', knex.raw('COUNT(pc.product_id) as count'))
      .groupBy('c.id', 'c.name')
      .orderByRaw('count DESC');

    return rows.map((row: any) => ({
      name: row.name,
      count: Number(row.count),
    }));
  }

  private async getTopSellingProducts(knex: any, limit: number) {
    const rows = await knex('products as p')
      .innerJoin('order_items as oi', 'p.id', 'oi.product_id')
      .innerJoin('orders as o', 'oi.order_id', 'o.id')
      .where('p.is_active', 1)
      .where('o.status', '!=', 'CANCELLED')
      .select(
        'p.id',
        'p.name',
        knex.raw('COALESCE(SUM(oi.quantity), 0) as soldCount'),
        knex.raw('COALESCE(SUM(oi.total), 0) as revenue'),
      )
      .groupBy('p.id', 'p.name')
      .orderBy('soldCount', 'DESC')
      .limit(limit);

    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      soldCount: Number(row.soldCount),
      revenue: Number(row.revenue),
    }));
  }

  // ─── Helpers ───────────────────────────────────────────

  private buildOverviewCard(current: number, previous: number) {
    let percentChange = 0;
    if (previous > 0) {
      percentChange = Math.round(((current - previous) / previous) * 1000) / 10;
    } else if (current > 0) {
      percentChange = 100;
    }

    return {
      value: current,
      percentChange,
      trend: (percentChange >= 0 ? 'up' : 'down') as 'up' | 'down',
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  private formatDateOnly(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().slice(0, 10);
  }
}
