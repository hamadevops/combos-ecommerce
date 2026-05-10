import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260401170000CreatePermissionGroups extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();

    // Create permission_groups table
    await knex.schema.createTable('permission_groups', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.string('key', 255).notNullable().unique();
      table.integer('display_order').defaultTo(0);
      table.timestamps(true, true);
    });

    // Add group_id FK to permissions
    await knex.schema.alterTable('permissions', (table) => {
      table.integer('group_id').unsigned().nullable();
      table
        .foreign('group_id')
        .references('id')
        .inTable('permission_groups')
        .onDelete('SET NULL');
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.alterTable('permissions', (table) => {
      table.dropForeign(['group_id']);
      table.dropColumn('group_id');
    });
    await knex.schema.dropTableIfExists('permission_groups');
  }
}
