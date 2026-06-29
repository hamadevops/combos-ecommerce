import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260401121500CreatePageViewsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('page_views', (table) => {
      table.increments('id').primary();
      table.string('session_id', 100).nullable().comment('Session ID để phân biệt unique visitors');
      table.string('path', 500).notNullable().comment('URL path đã truy cập');
      table.string('query_string', 1000).nullable().comment('Query parameters');
      table.string('method', 10).defaultTo('GET');
      table.string('ip', 45).nullable();
      table.string('user_agent', 500).nullable();
      table.string('referer', 500).nullable().comment('Referer URL');
      table.string('device_type', 20).nullable().comment('mobile / tablet / desktop');
      table.string('browser', 50).nullable().comment('Tên browser');
      table.string('os', 50).nullable().comment('Hệ điều hành');
      table.string('country', 10).nullable().comment('Country code từ CF header');
      table.string('utm_source', 100).nullable();
      table.string('utm_medium', 100).nullable();
      table.string('utm_campaign', 100).nullable();
      table.integer('response_time_ms').nullable().comment('Thời gian xử lý (ms)');
      table.integer('status_code').nullable().comment('HTTP status code');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // INDEX
      table.index(['created_at']);
      table.index(['session_id']);
      table.index(['created_at', 'session_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('page_views');
  }
}
