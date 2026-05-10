import { MigrationWithKnex } from '../config/migrate-knex';
export class Migration20251127170000CreateBaseRoles extends MigrationWithKnex {
  async up(): Promise<void> {
    const knex = this.getKnex();

    // Tạo roles nếu chưa tồn tại
    await knex('roles')
      .insert([
        {
          name: 'Administrator',
          key: 'admin',
          is_default: false, // admin không phải role mặc định
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'Member',
          key: 'member',
          is_default: true, // member là role mặc định cho user mới
          created_at: new Date(),
          updated_at: new Date(),
        },
      ])
      .onConflict(['key'])
      .ignore(); // tránh duplicate nếu chạy lại
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    await knex('roles').whereIn('key', ['admin', 'member']).delete();
  }
}
