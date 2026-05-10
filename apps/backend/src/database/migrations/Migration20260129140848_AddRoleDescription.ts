import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260129140848_AddRoleDescription extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('roles', (table) => {
      table.string('description', 255).nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('roles', (table) => {
      table.dropColumn('description');
    });
  }
}
