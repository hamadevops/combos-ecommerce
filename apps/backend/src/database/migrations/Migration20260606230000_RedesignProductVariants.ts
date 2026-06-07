import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260606230000_RedesignProductVariants extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('product_variants', (table) => {
      table.json('option_ids').nullable();
      table.json('option_values').nullable();
      table.datetime('deleted_at').nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('product_variants', (table) => {
      table.dropColumn('option_ids');
      table.dropColumn('option_values');
      table.dropColumn('deleted_at');
    });
  }
}
