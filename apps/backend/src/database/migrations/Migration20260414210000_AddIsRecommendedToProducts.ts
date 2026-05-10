import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260414210000AddIsRecommendedToProducts extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.tinyint('is_recommended').defaultTo(0).notNullable().comment('Đánh dấu sản phẩm đề xuất');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table) => {
      table.dropColumn('is_recommended');
    });
  }
}
