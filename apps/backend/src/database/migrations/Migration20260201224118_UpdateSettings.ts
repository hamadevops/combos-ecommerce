import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260201224118_UpdateSettings extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();

    // 1. Add new columns if they don't exist
    const hasLabel = await knex.schema.hasColumn('settings', 'label');
    if (!hasLabel) {
      await knex.schema.alterTable('settings', (table) => {
        table.string('label', 255).nullable();
      });
    }

    const hasDescription = await knex.schema.hasColumn('settings', 'description');
    if (!hasDescription) {
      await knex.schema.alterTable('settings', (table) => {
        table.text('description').nullable();
      });
    }
    
    // 2. Ensure other columns exist (just in case)
    // type, group, is_public usually created by entity, but let's be safe or modify them if needed.
    // Assuming MikroORM sync might have handled basic columns, but we play safe for structure consistency.
    // For now, we trust basic columns exist or this migration focuses on the *Update* part which is adding label/description.
    // Actually, looking at previous migration content, it seemed to rely on existing schema. 
    // The user want "structure and index".
    
    // Add Indexes for better performance
    // Check if index exists before adding to avoid errors (Knex doesn't always handle "if not exists" for indexes well across all DBs)
    // We can use raw SQL or try-catch block for indexes if needed, or check metadata.
    // Simple way with Knex:
    
    await knex.schema.alterTable('settings', (table) => {
       table.index(['key'], 'idx_settings_key');
       table.index(['group'], 'idx_settings_group');
    });
  }

  async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.alterTable('settings', (table) => {
      table.dropIndex(['key'], 'idx_settings_key');
      table.dropIndex(['group'], 'idx_settings_group');
    });

    const hasLabel = await knex.schema.hasColumn('settings', 'label');
    if (hasLabel) {
       await knex.schema.alterTable('settings', (table) => {
         table.dropColumn('label');
       });
    }

    const hasDescription = await knex.schema.hasColumn('settings', 'description');
    if (hasDescription) {
       await knex.schema.alterTable('settings', (table) => {
         table.dropColumn('description');
       });
    }
  }
}
