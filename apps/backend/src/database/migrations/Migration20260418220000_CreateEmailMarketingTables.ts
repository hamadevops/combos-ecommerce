import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260418220000_CreateEmailMarketingTables extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();

    // 1. em_config — Cấu hình SMTP riêng của module
    await knex.schema.createTable('em_config', (table) => {
      table.increments('id').primary();
      table.string('key', 255).notNullable().unique();
      table.text('value').nullable();
      table.string('label', 255).nullable();
      table.text('description').nullable();
      table.timestamps(true, true);
    });

    // 2. em_contacts — Danh bạ liên hệ
    await knex.schema.createTable('em_contacts', (table) => {
      table.increments('id').primary();
      table.string('email', 255).notNullable().unique().index();
      table.string('first_name', 255).nullable();
      table.string('last_name', 255).nullable();
      table.string('phone', 20).nullable();
      table.string('company', 255).nullable();
      table.boolean('is_subscribed').notNullable().defaultTo(true);
      table.datetime('unsubscribed_at').nullable();
      table.json('metadata').nullable();
      table.timestamps(true, true);
    });

    // 3. em_segments — Nhóm/phân khúc
    await knex.schema.createTable('em_segments', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.timestamps(true, true);
    });

    // 4. em_contact_segments — Pivot Contact ↔ Segment
    await knex.schema.createTable('em_contact_segments', (table) => {
      table.integer('em_contact_id').unsigned().notNullable();
      table.integer('em_segment_id').unsigned().notNullable();
      table.primary(['em_contact_id', 'em_segment_id']);
      table
        .foreign('em_contact_id')
        .references('id')
        .inTable('em_contacts')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .foreign('em_segment_id')
        .references('id')
        .inTable('em_segments')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });

    // 5. em_templates — Mẫu email
    await knex.schema.createTable('em_templates', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('subject', 255).notNullable();
      table.text('html_content').notNullable();
      table.json('design_data').nullable();
      table.string('preview_text', 255).nullable();
      table.timestamps(true, true);
    });

    // 6. em_campaigns — Chiến dịch
    await knex.schema.createTable('em_campaigns', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('template_id').unsigned().nullable();
      table.string('from_name', 255).nullable();
      table.string('from_email', 255).nullable();
      table.datetime('scheduled_at').nullable();
      table
        .enum('status', [
          'DRAFT',
          'SCHEDULED',
          'RUNNING',
          'COMPLETED',
          'PAUSED',
          'CANCELLED',
        ])
        .notNullable()
        .defaultTo('DRAFT');
      table.datetime('completed_at').nullable();
      table.integer('total_sent').notNullable().defaultTo(0);
      table.integer('total_failed').notNullable().defaultTo(0);
      table.integer('total_opened').notNullable().defaultTo(0);
      table.integer('total_clicked').notNullable().defaultTo(0);
      table.timestamps(true, true);
      table
        .foreign('template_id')
        .references('id')
        .inTable('em_templates')
        .onUpdate('CASCADE')
        .onDelete('SET NULL');
    });

    // 7. em_email_logs — Lịch sử gửi email
    await knex.schema.createTable('em_email_logs', (table) => {
      table.increments('id').primary();
      table.integer('campaign_id').unsigned().notNullable();
      table.integer('contact_id').notNullable().index();
      table.string('contact_email', 255).notNullable();
      table
        .enum('status', ['PENDING', 'SENT', 'FAILED', 'OPENED'])
        .notNullable()
        .defaultTo('PENDING');
      table.text('error_message').nullable();
      table.datetime('sent_at').nullable();
      table.datetime('opened_at').nullable();
      table.integer('open_count').notNullable().defaultTo(0);
      table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE');
    });

    // 8. em_campaign_segments — Pivot Campaign ↔ Segment
    await knex.schema.createTable('em_campaign_segments', (table) => {
      table.integer('em_campaign_id').unsigned().notNullable();
      table.integer('em_segment_id').unsigned().notNullable();
      table.primary(['em_campaign_id', 'em_segment_id']);
      table
        .foreign('em_campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
      table
        .foreign('em_segment_id')
        .references('id')
        .inTable('em_segments')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });

    // 9. em_tracked_links — URL tracking
    await knex.schema.createTable('em_tracked_links', (table) => {
      table.increments('id').primary();
      table.integer('campaign_id').unsigned().notNullable();
      table.text('original_url').notNullable();
      table.string('hash', 64).notNullable().unique().index();
      table.integer('click_count').notNullable().defaultTo(0);
      table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
      table
        .foreign('campaign_id')
        .references('id')
        .inTable('em_campaigns')
        .onUpdate('CASCADE');
    });

    // 10. em_link_clicks — Chi tiết click
    await knex.schema.createTable('em_link_clicks', (table) => {
      table.increments('id').primary();
      table.integer('email_log_id').unsigned().notNullable();
      table.integer('tracked_link_id').unsigned().notNullable();
      table.string('ip_address', 45).nullable();
      table.text('user_agent').nullable();
      table.datetime('clicked_at').notNullable().defaultTo(knex.fn.now());
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

  async down(): Promise<void> {
    const knex = this.getKnex();

    // Drop in reverse order to respect FK constraints
    await knex.schema.dropTableIfExists('em_link_clicks');
    await knex.schema.dropTableIfExists('em_tracked_links');
    await knex.schema.dropTableIfExists('em_campaign_segments');
    await knex.schema.dropTableIfExists('em_email_logs');
    await knex.schema.dropTableIfExists('em_campaigns');
    await knex.schema.dropTableIfExists('em_templates');
    await knex.schema.dropTableIfExists('em_contact_segments');
    await knex.schema.dropTableIfExists('em_segments');
    await knex.schema.dropTableIfExists('em_contacts');
    await knex.schema.dropTableIfExists('em_config');
  }
}
