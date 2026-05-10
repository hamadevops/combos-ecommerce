import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251226094954_CreatePopupsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // popups
    // =========================
    await knex.schema.createTable('popups', (table) => {
      table.increments('id').primary();
      table.string('description', 255).nullable();
      table.string('link', 255).nullable();
      table.string('image_url', 255).nullable();
      table.integer('priority').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);
      table.enum('position', ['CENTER', 'FOOTER', 'SIDEBAR']).notNullable();
      table.timestamps(true, true);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('popups');
  }
}
