import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251231220700AddUserProfileFields extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (table) => {
      table.string('avatar').nullable();
      table.text('bio').nullable();
      table.string('background').nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('avatar');
      table.dropColumn('bio');
      table.dropColumn('background');
    });
  }
}
