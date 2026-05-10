import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225142200_CreatePostsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // posts
    // =========================
    await knex.schema.createTable('posts', (table) => {
      table.increments('id').primary();
      table.string('title', 255).notNullable();
      table.string('slug', 255).notNullable();
      table.string('thumbnail', 500).nullable();
      table.text('excerpt').nullable(); // Short description
      table.specificType('content', 'LONGTEXT').nullable(); // Long content

      // Author
      table
        .integer('author_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE');

      // Status flags
      table.boolean('is_active').defaultTo(false);
      table.boolean('is_published').defaultTo(false);
      table.datetime('published_at').nullable(); // For scheduling

      // Metrics
      table.integer('view_count').defaultTo(0);

      // SEO fields
      table.string('meta_title', 255).nullable();
      table.text('meta_description').nullable();
      table.string('meta_keywords', 500).nullable();

      table.timestamps(true, true);

      // Indexes
      table.unique(['slug']);
      table.index(['author_id']);
      table.index(['is_active']);
      table.index(['is_published']);
      table.index(['published_at']);
      table.index(['created_at']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('posts');
  }
}
