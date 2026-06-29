import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260419102254_AddClickCountToEmailLogs extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('em_email_logs', (table) => {
      table
        .integer('click_count')
        .notNullable()
        .defaultTo(0)
        .after('open_count');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('em_email_logs', (table) => {
      table.dropColumn('click_count');
    });
  }
}
