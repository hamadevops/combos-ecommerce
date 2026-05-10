import { Migration } from '@mikro-orm/migrations';

export class Migration20260202213000_CreateWebhooks extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();
    
    const exists = await knex.schema.hasTable('webhooks');
    if (!exists) {
      await knex.schema.createTable('webhooks', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('url', 255).notNullable();
        table.string('method', 10).defaultTo('POST').notNullable();
        table.boolean('is_enabled').defaultTo(true).notNullable();
        table.json('events').notNullable().comment('List of events to trigger the webhook. Example: ["order.created", "product.updated"]'); 
        table.json('headers').nullable().comment('Custom headers to send with the webhook request. Example: {"Authorization": "Bearer token"}');
        table.datetime('created_at').notNullable();
        table.datetime('updated_at').notNullable();
      });
    }
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('webhooks');
  }
}
