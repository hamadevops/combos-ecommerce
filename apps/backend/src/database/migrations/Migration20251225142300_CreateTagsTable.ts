import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225142300_CreateTagsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // tags
    // =========================
    await knex.schema.createTable('tags', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('slug', 100).notNullable();
      table.timestamps(true, true);

      // Indexes
      table.unique(['name']);
      table.unique(['slug']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('tags');
  }
}
