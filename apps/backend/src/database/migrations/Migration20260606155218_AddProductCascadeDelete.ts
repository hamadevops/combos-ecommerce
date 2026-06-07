import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260606155218_AddProductCascadeDelete extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    // Drop old foreign keys
    await knex.schema.alterTable('product_images', (table) => {
      table.dropForeign(['product_id'], 'product_images_product_id_foreign');
    });
    await knex.schema.alterTable('product_variants', (table) => {
      table.dropForeign(['product_id'], 'product_variants_product_id_foreign');
    });
    await knex.schema.alterTable('reviews', (table) => {
      table.dropForeign(['product_id'], 'reviews_product_id_foreign');
    });

    // Modify columns
    await knex.schema.alterTable('customers', (table) => {
      table.decimal('total_spent', 15, 2).notNullable().defaultTo(0).alter();
    });
    await knex.schema.alterTable('orders', (table) => {
      table.decimal('total_amount', 15, 2).notNullable().defaultTo(0).alter();
      table.decimal('shipping_fee', 15, 2).notNullable().defaultTo(0).alter();
      table.decimal('discount_amount', 15, 2).notNullable().defaultTo(0).alter();
      table.decimal('final_amount', 15, 2).notNullable().defaultTo(0).alter();
    });

    // Add new foreign keys with CASCADE
    await knex.schema.alterTable('product_images', (table) => {
      table.foreign('product_id', 'product_images_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });
    await knex.schema.alterTable('product_variants', (table) => {
      table.foreign('product_id', 'product_variants_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });
    await knex.schema.alterTable('reviews', (table) => {
      table.foreign('product_id', 'reviews_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    // Drop cascade foreign keys
    await knex.schema.alterTable('product_images', (table) => {
      table.dropForeign(['product_id'], 'product_images_product_id_foreign');
    });
    await knex.schema.alterTable('product_variants', (table) => {
      table.dropForeign(['product_id'], 'product_variants_product_id_foreign');
    });
    await knex.schema.alterTable('reviews', (table) => {
      table.dropForeign(['product_id'], 'reviews_product_id_foreign');
    });

    // Revert columns
    await knex.schema.alterTable('customers', (table) => {
      table.decimal('total_spent', 15, 2).notNullable().defaultTo(0.00).alter();
    });
    await knex.schema.alterTable('orders', (table) => {
      table.decimal('total_amount', 15, 2).notNullable().defaultTo(0.00).alter();
      table.decimal('shipping_fee', 15, 2).notNullable().defaultTo(0.00).alter();
      table.decimal('discount_amount', 15, 2).notNullable().defaultTo(0.00).alter();
      table.decimal('final_amount', 15, 2).notNullable().defaultTo(0.00).alter();
    });

    // Recreate old foreign keys
    await knex.schema.alterTable('product_images', (table) => {
      table.foreign('product_id', 'product_images_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('NO ACTION');
    });
    await knex.schema.alterTable('product_variants', (table) => {
      table.foreign('product_id', 'product_variants_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('NO ACTION');
    });
    await knex.schema.alterTable('reviews', (table) => {
      table.foreign('product_id', 'reviews_product_id_foreign')
        .references('id')
        .inTable('products')
        .onUpdate('CASCADE')
        .onDelete('NO ACTION');
    });
  }
}
