import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260606155622_AddProductSoftDelete extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('products', (table) => {
      table.datetime('deleted_at').nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('products', (table) => {
      table.dropColumn('deleted_at');
    });
  }
}
