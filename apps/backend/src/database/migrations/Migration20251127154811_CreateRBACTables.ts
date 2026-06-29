import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20251127165000CreateRBACTables extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();
    try {
      // Roles
      await knex.schema.createTable('roles', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable().unique();
        table.string('key', 255).notNullable().unique();
        table.integer('parent_id').unsigned().nullable();
        table.boolean('is_default').notNullable().defaultTo(false);
        table.timestamps(true, true);
      });

      await knex.schema.alterTable('roles', (table) => {
        table
          .foreign('parent_id')
          .references('id')
          .inTable('roles')
          .onDelete('SET NULL');
      });

      // Permissions
      await knex.schema.createTable('permissions', (table) => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.string('key', 255).notNullable();
        table.string('method', 16).notNullable();
        table.string('path', 255).notNullable();
        table.timestamps(true, true);
      });

      // Pivot
      await knex.schema.createTable('role_permissions', (table) => {
        table.integer('role_id').unsigned().notNullable();
        table.integer('permission_id').unsigned().notNullable();
        table.timestamps(true, true);
        table.primary(['role_id', 'permission_id']);
        table
          .foreign('role_id')
          .references('id')
          .inTable('roles')
          .onDelete('CASCADE');
        table
          .foreign('permission_id')
          .references('id')
          .inTable('permissions')
          .onDelete('CASCADE');
      });

      // Add role_id to users
      await knex.schema.alterTable('users', (table) => {
        table.integer('role_id').nullable().unsigned();
        table
          .foreign('role_id')
          .references('id')
          .inTable('roles')
          .onDelete('SET NULL');
      });
    } catch (err) {
      console.error('Migration failed, rolling back...', err);

      // Manual rollback
      await knex.schema.alterTable('users', (table) => {
        table.dropColumn('role_id');
      });
      await knex.schema.dropTableIfExists('role_permissions');
      await knex.schema.dropTableIfExists('permissions');
      await knex.schema.dropTableIfExists('roles');

      throw err;
    }
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    // Drop foreign key constraint first, then the column
    await knex.schema.alterTable('users', (table) => {
      table.dropForeign(['role_id']);
      table.dropColumn('role_id');
    });
    await knex.schema.dropTableIfExists('role_permissions');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
  }
}
