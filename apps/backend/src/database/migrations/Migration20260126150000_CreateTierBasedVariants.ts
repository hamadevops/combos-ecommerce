import { MigrationWithKnex } from '../config/migrate-knex';

/**
 * Migration: CreateTierBasedVariants
 * 
 * Tạo các bảng mới cho hệ thống biến thể sản phẩm theo tier (Shopee/TikTok style):
 * - product_tier_variations: Các tier phân loại (Màu sắc, Size, etc.)
 * - tier_options: Các option trong mỗi tier (Đỏ, Xanh, XL, etc.)
 * - variant_tier_indexes: Liên kết variant với tier options
 * 
 * Đồng thời thêm cột 'name' vào product_variants để lưu tên hiển thị
 */
export class Migration20260126150000CreateTierBasedVariants extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // product_tier_variations
    // =========================
    await knex.schema.createTable('product_tier_variations', (table) => {
      table.increments('id').primary();

      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table.string('name').notNullable().comment('Tên tier: Màu sắc, Kích thước, Dung lượng');
      table.tinyint('tier_index').notNullable().defaultTo(0).comment('0 = tier1 (có ảnh), 1 = tier2');
      table.integer('position').notNullable().defaultTo(0);

      table.timestamps(true, true);

      // INDEX
      table.index(['product_id']);
      table.index(['tier_index']);
    });

    // =========================
    // tier_options
    // =========================
    await knex.schema.createTable('tier_options', (table) => {
      table.increments('id').primary();

      table
        .integer('tier_variation_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('product_tier_variations')
        .onDelete('CASCADE');

      table.string('value').notNullable().comment('Giá trị option: Đỏ, XL, 256GB');
      table.string('image_url', 500).nullable().comment('URL ảnh (chỉ dùng cho tier1)');
      table.integer('position').notNullable().defaultTo(0);
      table.tinyint('is_active').notNullable().defaultTo(1);

      table.timestamps(true, true);

      // INDEX
      table.index(['tier_variation_id']);
      table.index(['position']);
    });

    // =========================
    // variant_tier_indexes (pivot)
    // =========================
    await knex.schema.createTable('variant_tier_indexes', (table) => {
      table.increments('id').primary();

      table
        .integer('variant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('product_variants')
        .onDelete('CASCADE');

      table
        .integer('tier_option_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tier_options')
        .onDelete('CASCADE');

      table.tinyint('tier_index').notNullable().comment('0 = tier1, 1 = tier2');

      table.timestamp('created_at').defaultTo(knex.fn.now());

      // UNIQUE constraint: mỗi variant chỉ có 1 option cho mỗi tier
      table.unique(['variant_id', 'tier_index']);

      // INDEX
      table.index(['variant_id']);
      table.index(['tier_option_id']);
    });

    // =========================
    // Thêm cột 'name' vào product_variants
    // =========================
    await knex.schema.alterTable('product_variants', (table) => {
      table.string('name').nullable().after('sku').comment('Tên hiển thị: Đỏ - XL');
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();

    // Xóa cột 'name' khỏi product_variants
    await knex.schema.alterTable('product_variants', (table) => {
      table.dropColumn('name');
    });

    // Xóa các bảng theo thứ tự ngược lại
    await knex.schema.dropTableIfExists('variant_tier_indexes');
    await knex.schema.dropTableIfExists('tier_options');
    await knex.schema.dropTableIfExists('product_tier_variations');
  }
}
