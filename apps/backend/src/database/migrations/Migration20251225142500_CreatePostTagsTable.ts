import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225142500_CreatePostTagsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // post_tags (pivot table for many-to-many)
    // =========================
    await knex.schema.createTable('post_tags', (table) => {
      table
        .integer('post_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE');

      table.timestamps(true, true);

      // Composite primary key
      table.primary(['post_id', 'tag_id']);

      // Index for reverse lookup (find posts by tag)
      table.index(['tag_id', 'post_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('post_tags');
  }
}
