import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260328031020_AddColumnVisibleVideoProduct extends MigrationWithKnex {

  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('product_videos', (table) => {
      table.tinyint('is_visible').notNullable().defaultTo(1);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('product_videos', (table) => {
      table.dropColumn('is_visible');
    });
  }

}
