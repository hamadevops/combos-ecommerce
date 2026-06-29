import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260629043000AddProductTypeAndAffiliateLinkToProducts extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.string('product_type', 255).defaultTo('purchase').notNullable().comment('Loại sản phẩm: purchase hoặc affiliate');
      table.text('affiliate_link').nullable().comment('Đường dẫn affiliate sản phẩm');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.dropColumn('product_type');
      table.dropColumn('affiliate_link');
    });
  }
}
