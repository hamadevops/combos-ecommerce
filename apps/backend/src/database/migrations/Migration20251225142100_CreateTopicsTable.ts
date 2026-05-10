import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225142100_CreateTopicsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // topics
    // =========================
    await knex.schema.createTable('topics', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('slug', 255).notNullable();
      table.text('description').nullable();

      // Hierarchical structure with level limit
      table
        .integer('parent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('topics')
        .onDelete('SET NULL');

      table.integer('level').notNullable().defaultTo(0); // 0, 1, or 2 (max 3 levels)
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
      table.index(['level']);
      table.index(['is_active']);
      table.index(['sort_order']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('topics');
  }
}
