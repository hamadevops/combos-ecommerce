import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225133800_CreateProductCategoriesTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // product_categories (pivot table for many-to-many)
    // =========================
    await knex.schema.createTable('product_categories', (table) => {
      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('products')
        .onDelete('CASCADE');

      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE');

      table.timestamps(true, true);

      // Composite primary key
      table.primary(['product_id', 'category_id']);

      // Index for reverse lookup (find products by category)
      table.index(['category_id', 'product_id']);
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('product_categories');
  }
}
