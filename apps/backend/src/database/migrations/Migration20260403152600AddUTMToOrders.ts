import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260403152600_AddUTMToOrders extends MigrationWithKnex {

  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('orders', (table) => {
      table.string('utm_source', 255).nullable();
      table.string('utm_medium', 255).nullable();
      table.string('utm_campaign', 255).nullable();
      table.string('utm_term', 255).nullable();
      table.string('utm_content', 255).nullable();
      table.string('marketing_platform', 255).nullable();
      table.string('marketing_platform_id', 255).nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('orders', (table) => {
      table.dropColumn('utm_source');
      table.dropColumn('utm_medium');
      table.dropColumn('utm_campaign');
      table.dropColumn('utm_term');
      table.dropColumn('utm_content');
      table.dropColumn('marketing_platform');
      table.dropColumn('marketing_platform_id');
    });
  }

}
