import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260203142813AddSpecificationsToProducts extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('products', (table) => {
      table.json('specifications').nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('products', (table) => {
      table.dropColumn('specifications');
    });
  }
}
