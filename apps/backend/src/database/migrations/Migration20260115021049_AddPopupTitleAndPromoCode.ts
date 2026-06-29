import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260115021049_AddPopupTitleAndPromoCode extends MigrationWithKnex {

  override async up(): Promise<void> {
    const knex = this.getKnex();

    // Add title and promo_code to popups table
    await knex.schema.table('popups', (table) => {
      table.string('title', 255).nullable();
      table.string('promo_code', 255).nullable();
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.table('popups', (table) => {
      table.dropColumn('title');
      table.dropColumn('promo_code');
    });
  }

}
