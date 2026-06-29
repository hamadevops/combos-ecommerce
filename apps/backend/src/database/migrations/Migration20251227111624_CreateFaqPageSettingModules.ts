import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251227111624CreateFaqPageSettingModules extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // =========================
    // faqs
    // =========================
    await knex.schema.createTable('faqs', (table) => {
      table.increments('id').primary();
      table.text('question').notNullable();
      table.text('answer').notNullable();
      table.integer('sort_order').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });

    // =========================
    // pages
    // =========================
    await knex.schema.createTable('pages', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('slug').notNullable().unique();
      table.specificType('content', 'LONGTEXT');
      table.boolean('is_active').defaultTo(true);
      table.string('type').defaultTo('standard'); // standard, system

      // SEO
      table.string('meta_title');
      table.text('meta_description');
      table.string('meta_keywords', 500);

      table.timestamps(true, true);

      // INDEX
      table.index(['type']);
    });

    // =========================
    // settings
    // =========================
    await knex.schema.createTable('settings', (table) => {
      table.increments('id').primary();
      table.string('key').notNullable().unique();
      table.text('value');
      table.string('type').defaultTo('string'); // string, boolean, json, number
      table.boolean('is_public').defaultTo(false);
      table.string('group').defaultTo('general'); // general, contact, social, appearance

      table.timestamps(true, true);

      // INDEX
      table.index(['group', 'is_public']);
    });
  }

  // =========================
  // ROLLBACK (DOWN)
  // =========================
  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('settings');
    await knex.schema.dropTableIfExists('pages');
    await knex.schema.dropTableIfExists('faqs');
  }
}
