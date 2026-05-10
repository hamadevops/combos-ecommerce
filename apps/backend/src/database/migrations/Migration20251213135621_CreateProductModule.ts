import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251213135621CreateProductModule extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // products
    // =========================
    await knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('slug').notNullable();
      table.string('sku');

      table.text('short_description');
      table.specificType('description', 'MEDIUMTEXT');

      table.string('seo_title');
      table.string('seo_description', 500);
      table.string('seo_keywords');
      table.string('canonical_url');
      table.string('og_image');

      table.boolean('is_active').defaultTo(true);
      table.datetime('published_at');

      table.timestamps(true, true);

      // INDEX
      table.unique(['slug']);
      table.index(['is_active', 'published_at']);
      table.index(['sku']);
    });

    // =========================
    // product_images
    // =========================
    await knex.schema.createTable('product_images', (table) => {
      table.increments('id').primary();

      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table.string('url').notNullable();
      table.string('alt_text');
      table.integer('position').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // INDEX
      table.index(['product_id', 'position']);
    });

    // =========================
    // product_variants
    // =========================
    await knex.schema.createTable('product_variants', (table) => {
      table.increments('id').primary();

      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table.string('sku').unique();
      table.decimal('price', 12, 2).notNullable();
      table.decimal('sale_price', 12, 2);
      table.decimal('cost_price', 12, 2);
      table.integer('stock').defaultTo(0);
      table.boolean('is_active').defaultTo(true);

      table.timestamps(true, true);

      // INDEX
      table.index(['product_id']);
      table.index(['is_active']);
      table.index(['price', 'sale_price']);
    });

    // =========================
    // attributes
    // =========================
    await knex.schema.createTable('attributes', (table) => {
      table.increments('id').primary();
      table.string('code').notNullable();
      table.string('name').notNullable();

      // INDEX
      table.unique(['code']);
    });

    // =========================
    // attribute_values
    // =========================
    await knex.schema.createTable('attribute_values', (table) => {
      table.increments('id').primary();

      table
        .integer('attribute_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('attributes')
        .onDelete('CASCADE');

      table.string('value').notNullable();

      // INDEX
      table.index(['attribute_id', 'value']);
    });

    // =========================
    // variant_attributes (pivot)
    // =========================
    await knex.schema.createTable('variant_attributes', (table) => {
      table
        .integer('variant_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('product_variants')
        .onDelete('CASCADE');

      table
        .integer('attribute_value_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('attribute_values')
        .onDelete('CASCADE');

      table.primary(['variant_id', 'attribute_value_id']);

      // INDEX hỗ trợ filter
      table.index(['attribute_value_id', 'variant_id']);
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('variant_attributes');
    await knex.schema.dropTableIfExists('attribute_values');
    await knex.schema.dropTableIfExists('attributes');
    await knex.schema.dropTableIfExists('product_variants');
    await knex.schema.dropTableIfExists('product_images');
    await knex.schema.dropTableIfExists('products');
  }
}
