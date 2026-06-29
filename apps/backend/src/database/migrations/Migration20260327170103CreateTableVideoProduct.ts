import { MigrationWithKnex } from '../config/migrate-knex';

export class Migration20260327170103_CreateTableVideoProduct extends MigrationWithKnex {

  override async up(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.createTable("product_videos", table => {
      table.increments("id").primary();
      
      // Khóa ngoại liên kết với bảng products (xóa video khi xóa product)
      table.integer("product_id").unsigned().notNullable()
        .references("id").inTable("products")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
        
      // Thông tin video
      table.string("video_url").notNullable().comment("Đường dẫn tới file video hoặc link YouTube/TikTok");
      table.string("thumbnail_url").nullable().comment("Đường dẫn ảnh bìa của video (có thể trống)");
      table.integer("display_order").notNullable().defaultTo(0).comment("Thứ tự hiển thị video");
      
      table.timestamps(true, true);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();
    await knex.schema.dropTable("product_videos")
  }

}
