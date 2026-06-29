import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260401153500UpdatePermissions extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('permissions', (table) => {
      table.dropColumn('path');
      table.string('method', 16).nullable().alter();
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('permissions', (table) => {
      table.string('path', 255).notNullable().defaultTo('');
      table.string('method', 16).notNullable().alter();
    });
  }
}
