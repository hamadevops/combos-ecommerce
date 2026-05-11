import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260419113600_AddCascadeDeleteToEmailMarketing extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // em_email_logs -> em_campaigns
    await knex.schema.alterTable('em_email_logs', (table) => {
      table.dropForeign(['campaign_id']);
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });

    // em_tracked_links -> em_campaigns
    await knex.schema.alterTable('em_tracked_links', (table) => {
      table.dropForeign(['campaign_id']);
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });

    // em_link_clicks
    await knex.schema.alterTable('em_link_clicks', (table) => {
      table.dropForeign(['email_log_id']);
      table.dropForeign(['tracked_link_id']);
      table
        .foreign('email_log_id')
        .references('id')
        .inTable('em_email_logs')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .foreign('tracked_link_id')
        .references('id')
        .inTable('em_tracked_links')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('em_email_logs', (table) => {
      table.dropForeign(['campaign_id']);
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE');
    });

    await knex.schema.alterTable('em_tracked_links', (table) => {
      table.dropForeign(['campaign_id']);
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE');
    });

    await knex.schema.alterTable('em_link_clicks', (table) => {
      table.dropForeign(['email_log_id']);
      table.dropForeign(['tracked_link_id']);
      table
        .foreign('email_log_id')
        .references('id')
        .inTable('em_email_logs')
        .onUpdate('CASCADE');
      table
        .foreign('tracked_link_id')
        .references('id')
        .inTable('em_tracked_links')
        .onUpdate('CASCADE');
    });
  }
}
