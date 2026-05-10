import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251127152658CreateTableUser extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').notNullable();
      table.timestamps(true, true);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTable('users');
  }
}
