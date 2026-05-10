import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225142400_CreatePostTopicsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // post_topics (pivot table for many-to-many)
    // =========================
    await knex.schema.createTable('post_topics', (table) => {
      table
        .integer('post_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE');

      table
        .integer('topic_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('topics')
        .onDelete('CASCADE');

      table.timestamps(true, true);

      // Composite primary key
      table.primary(['post_id', 'topic_id']);

      // Index for reverse lookup (find posts by topic)
      table.index(['topic_id', 'post_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('post_topics');
  }
}
