import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260401102900AddDisplayOrderToProducts extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.integer('display_order').defaultTo(0).notNullable().comment('Thứ tự hiển thị sản phẩm');
      table.index(['display_order']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.dropIndex(['display_order']);
      table.dropColumn('display_order');
    });
  }
}
