
import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260118131626CreateReviewsTable extends MigrationWithKnex {
  override async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('reviews', (table) => {
      table.increments('id').primary();
      
      table.integer('product_id').unsigned().notNullable()
        .references('id').inTable('products').onDelete('CASCADE');

      table.integer('rating').notNullable();
      table.text('comment').notNullable();
      table.string('reviewer_name').notNullable();
      table.string('reviewer_avatar');
      table.string('reviewer_email');
      table.string('image');
      
      table.timestamps(true, true);

      table.index(['product_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTableIfExists('reviews');
  }
}
