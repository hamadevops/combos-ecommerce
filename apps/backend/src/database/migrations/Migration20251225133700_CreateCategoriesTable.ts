import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225133700_CreateCategoriesTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // categories
    // =========================
    await knex.schema.createTable('categories', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('slug', 255).notNullable();
      table.text('description').nullable();
      table.string('image', 500).nullable();

      // Hierarchical structure
      table
        .integer('parent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL');

      table.boolean('is_active').defaultTo(true);
      table.integer('sort_order').defaultTo(0);

      // SEO fields
      table.string('meta_title', 255).nullable();
      table.text('meta_description').nullable();
      table.string('meta_keywords', 500).nullable();

      table.timestamps(true, true);

      // Indexes
      table.unique(['slug']);
      table.index(['parent_id']);
      table.index(['is_active']);
      table.index(['sort_order']);
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('categories');
  }
}
