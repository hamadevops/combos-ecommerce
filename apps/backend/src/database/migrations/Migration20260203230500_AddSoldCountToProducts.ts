import { Migration } from '@mikro-orm/migrations';
import { Knex } from 'knex';

export class Migration20260203230500_AddSoldCountToProducts extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table: Knex.AlterTableBuilder) => {
      table.integer('sold_count').notNullable().defaultTo(0).after('published_at');
      table.index('sold_count', 'idx_products_sold_count');
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('products', (table: Knex.AlterTableBuilder) => {
      table.dropIndex('sold_count', 'idx_products_sold_count');
      table.dropColumn('sold_count');
    });
  }
}

