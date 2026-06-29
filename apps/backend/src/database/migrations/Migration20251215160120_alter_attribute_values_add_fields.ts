import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251215160120AlterAttributeValuesAddFields extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('attribute_values', (table) => {
      // thêm hex color
      table.string('hex', 10).nullable().after('value');

      // sort order
      table.integer('sort_order').notNullable().defaultTo(0).after('hex');

      // active flag
      table
        .boolean('is_active')
        .notNullable()
        .defaultTo(true)
        .after('sort_order');
    });
    // thêm unique composite
    await knex.schema.alterTable('attribute_values', (table) => {
      table.unique(['attribute_id', 'value'], 'uq_attribute_value');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('attribute_values', (table) => {
      table.dropUnique(['attribute_id', 'value'], 'uq_attribute_value');
    });

    // =========================
    // remove columns
    // =========================
    await knex.schema.alterTable('attribute_values', (table) => {
      table.dropColumn('hex');
      table.dropColumn('sort_order');
      table.dropColumn('is_active');
    });
  }
}
