import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260606181231_CreateContactsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('contacts', (table) => {
      table.increments('id').primary();
      table.string('name').nullable();
      table.string('email').notNullable();
      table.string('phone').nullable();
      table.text('message').nullable();
      table.enum('type', ['NEWSLETTER', 'CONTACT_FORM']).notNullable();
      table.json('metadata').nullable();
      table.string('utm_source').nullable();
      table.string('utm_medium').nullable();
      table.string('utm_campaign').nullable();
      table.string('utm_term').nullable();
      table.string('utm_content').nullable();
      table.enum('status', ['UNREAD', 'READ', 'REPLIED']).notNullable().defaultTo('UNREAD');
      table.datetime('created_at').notNullable();
      table.datetime('updated_at').notNullable();
      
      table.index(['email']);
      table.index(['type']);
      table.index(['status']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('contacts');
  }
}
