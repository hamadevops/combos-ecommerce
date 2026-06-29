import { MigrationWithKnex } from '../config/migrate-knex';

/**
 * Migration: CreateOrderSystem
 * 
 * Tạo các bảng cho hệ thống đơn hàng:
 * - customers: Thông tin khách hàng
 * - orders: Đơn hàng
 * - order_items: Chi tiết sản phẩm trong đơn hàng
 */
export class Migration20260131090000_CreateOrderSystem extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // customers
    // =========================
    await knex.schema.createTable('customers', (table) => {
      table.increments('id').primary();
      table.string('full_name', 255).notNullable();
      table.string('email', 255).nullable();
      table.string('phone', 20).nullable();
      table.string('city', 255).nullable();
      table.string('district', 255).nullable();
      table.string('ward', 255).nullable();
      table.text('address').nullable();

      table.integer('total_orders').notNullable().defaultTo(0);
      table.decimal('total_spent', 15, 2).notNullable().defaultTo(0);
      table.timestamp('last_order_at').nullable();

      table.timestamps(true, true);

      // Indexes
      table.index(['phone']);
      table.index(['email']);
    });

    // =========================
    // orders
    // =========================
    await knex.schema.createTable('orders', (table) => {
      table.increments('id').primary();
      table.string('code', 50).notNullable().unique();

      table
        .integer('customer_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('customers')
        .onDelete('SET NULL');

      // Snapshot customer info
      table.string('customer_name', 255).notNullable();
      table.string('customer_email', 255).nullable();
      table.string('customer_phone', 20).nullable();

      // Shipping info
      table.text('shipping_address').nullable();
      table.string('shipping_city', 255).nullable();
      table.string('shipping_district', 255).nullable();
      table.string('shipping_ward', 255).nullable();
      table.text('notes').nullable();

      // Amounts
      table.decimal('total_amount', 15, 2).notNullable().defaultTo(0);
      table.decimal('shipping_fee', 15, 2).notNullable().defaultTo(0);
      table.decimal('discount_amount', 15, 2).notNullable().defaultTo(0);
      table.decimal('final_amount', 15, 2).notNullable().defaultTo(0);

      // Payment & Status
      table
        .enum('payment_method', ['COD', 'BANK_TRANSFER'])
        .notNullable()
        .defaultTo('COD');
      table
        .enum('payment_status', ['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
        .notNullable()
        .defaultTo('PENDING');
      table
        .enum('status', ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED'])
        .notNullable()
        .defaultTo('PENDING');

      table.timestamps(true, true);

      // Indexes
      table.index(['customer_id']);
      table.index(['status']);
      table.index(['payment_status']);
      table.index(['created_at']);
    });

    // =========================
    // order_items
    // =========================
    await knex.schema.createTable('order_items', (table) => {
      table.increments('id').primary();

      table
        .integer('order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('orders')
        .onDelete('CASCADE');

      table
        .integer('product_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('products')
        .onDelete('SET NULL');

      table
        .integer('product_variant_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('product_variants')
        .onDelete('SET NULL');

      // Snapshot fields
      table.string('product_name', 255).notNullable();
      table.string('variant_name', 255).nullable();
      table.json('variant_options').nullable();
      table.string('sku', 100).nullable();
      table.string('thumbnail', 500).nullable();

      table.integer('quantity').notNullable().defaultTo(1);
      table.decimal('price', 15, 2).notNullable();
      table.decimal('cost_price', 15, 2).nullable();
      table.decimal('total', 15, 2).notNullable();

      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index(['order_id']);
      table.index(['product_id']);
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('order_items');
    await knex.schema.dropTableIfExists('orders');
    await knex.schema.dropTableIfExists('customers');
  }
}
