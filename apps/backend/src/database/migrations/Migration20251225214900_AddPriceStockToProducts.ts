import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251225214900_AddPriceStockToProducts extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      // Add pricing fields
      table.decimal('price', 12, 2).notNullable().defaultTo(0);
      table.decimal('sale_price', 12, 2).nullable();
      table.decimal('cost_price', 12, 2).nullable();

      // Add inventory field
      table.integer('stock').notNullable().defaultTo(0);

      // Add featured flag
      table.boolean('is_featured').defaultTo(false);

      // Add index for price and featured
      table.index(['price', 'sale_price']);
      table.index(['is_featured']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.dropColumn('price');
      table.dropColumn('sale_price');
      table.dropColumn('cost_price');
      table.dropColumn('stock');
      table.dropColumn('is_featured');
    });
  }
}
