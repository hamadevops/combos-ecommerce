import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260129220000_AddPhoneToUser extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (table) => {
      table.string('phone', 20).nullable();
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('phone');
    });
  }
}
