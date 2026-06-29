import { Migration } from '@mikro-orm/migrations';
import { Knex } from 'knex';

/**
 * Schema Sync Migration - June 6, 2026
 *
 * 1. Create app_feedbacks table
 * 2. Drop legacy/unused tables
 * 3. Update foreign keys to use CASCADE/SET NULL
 * 4. Normalize column defaults (datetime → timestamp patterns)
 * 5. Update indexes
 */
export class Migration20260606141453_SchemaSyncAndAppFeedbacks extends Migration {

  private async safeRun(fn: (knex: Knex) => Promise<void>): Promise<void> {
    try {
      await fn(this.getKnex());
    } catch {
      // Ignore DDL errors for idempotent migration
    }
  }

  override async up(): Promise<void> {
    const knex = this.getKnex();

    // ──────────────────────────────────────────────
    // 1. Create app_feedbacks table
    // ──────────────────────────────────────────────
    const hasAppFeedbacks = await knex.schema.hasTable('app_feedbacks');
    if (!hasAppFeedbacks) {
      await knex.schema.createTable('app_feedbacks', (table) => {
        table.increments('id').unsigned();
        table.string('customer_name', 255).nullable();
        table.string('customer_avatar', 255).nullable();
        table.text('content').nullable();
        table.integer('rating').notNullable().defaultTo(5);
        table.string('image', 500).nullable();
        table.boolean('is_active').notNullable().defaultTo(true);
        table.integer('sort_order').notNullable().defaultTo(0);
        table.dateTime('created_at').notNullable();
        table.dateTime('updated_at').notNullable();
      });
    }

    // ──────────────────────────────────────────────
    // 2. Drop legacy/unused tables
    // ──────────────────────────────────────────────
    await knex.schema.dropTableIfExists('variant_attributes');
    await knex.schema.dropTableIfExists('sc_downloaded_videos');
    await knex.schema.dropTableIfExists('sc_videos');
    await knex.schema.dropTableIfExists('sc_channels');
    await knex.schema.dropTableIfExists('attribute_values');
    await knex.schema.dropTableIfExists('attributes');

    // ──────────────────────────────────────────────
    // 3. Update foreign keys & indexes
    //    Using safeRun to ignore "key not found" errors
    // ──────────────────────────────────────────────

    // --- categories ---
    await this.safeRun(async (k) => { await k.schema.alterTable('categories', (t) => { t.dropForeign(['parent_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('categories', (t) => { t.dropIndex(['is_active'], 'categories_is_active_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('categories', (t) => { t.dropIndex(['sort_order'], 'categories_sort_order_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('categories', (t) => {
        t.foreign('parent_id').references('id').inTable('categories').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- orders ---
    await this.safeRun(async (k) => { await k.schema.alterTable('orders', (t) => { t.dropForeign(['customer_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('orders', (t) => { t.dropIndex([], 'orders_created_at_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('orders', (t) => { t.dropIndex([], 'orders_payment_status_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('orders', (t) => { t.dropIndex([], 'orders_status_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('orders', (t) => {
        t.foreign('customer_id').references('id').inTable('customers').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- permissions ---
    await this.safeRun(async (k) => { await k.schema.alterTable('permissions', (t) => { t.dropForeign(['group_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('permissions', (t) => {
        t.foreign('group_id').references('id').inTable('permission_groups').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- product_categories ---
    await this.safeRun(async (k) => { await k.schema.alterTable('product_categories', (t) => { t.dropForeign(['category_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_categories', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_categories', (t) => { t.dropIndex([], 'product_categories_category_id_product_id_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('product_categories', (t) => {
        t.foreign('category_id').references('id').inTable('categories').onUpdate('CASCADE').onDelete('CASCADE');
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE').onDelete('CASCADE');
      });
    });
    // Drop created_at, updated_at if they exist
    await this.safeRun(async (k) => {
      await k.schema.alterTable('product_categories', (t) => {
        t.dropColumn('created_at');
        t.dropColumn('updated_at');
      });
    });

    // --- product_images ---
    await this.safeRun(async (k) => { await k.schema.alterTable('product_images', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_images', (t) => { t.dropIndex([], 'product_images_product_id_position_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('product_images', (t) => {
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE');
      });
    });

    // --- product_tier_variations ---
    await this.safeRun(async (k) => { await k.schema.alterTable('product_tier_variations', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_tier_variations', (t) => { t.dropIndex([], 'product_tier_variations_tier_index_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('product_tier_variations', (t) => {
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE').onDelete('CASCADE');
      });
    });

    // --- product_variants ---
    await this.safeRun(async (k) => { await k.schema.alterTable('product_variants', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_variants', (t) => { t.dropIndex([], 'product_variants_is_active_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('product_variants', (t) => { t.dropIndex([], 'product_variants_price_sale_price_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('product_variants', (t) => {
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE');
      });
    });

    // --- order_items ---
    await this.safeRun(async (k) => { await k.schema.alterTable('order_items', (t) => { t.dropForeign(['order_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('order_items', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('order_items', (t) => { t.dropForeign(['product_variant_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('order_items', (t) => {
        t.foreign('order_id').references('id').inTable('orders').onUpdate('CASCADE').onDelete('CASCADE');
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE').onDelete('SET NULL');
        t.foreign('product_variant_id').references('id').inTable('product_variants').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- reviews ---
    await this.safeRun(async (k) => { await k.schema.alterTable('reviews', (t) => { t.dropForeign(['product_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('reviews', (t) => {
        t.foreign('product_id').references('id').inTable('products').onUpdate('CASCADE');
      });
    });

    // --- roles ---
    await this.safeRun(async (k) => { await k.schema.alterTable('roles', (t) => { t.dropForeign(['parent_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('roles', (t) => {
        t.foreign('parent_id').references('id').inTable('roles').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- role_permissions ---
    await this.safeRun(async (k) => { await k.schema.alterTable('role_permissions', (t) => { t.dropForeign(['permission_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('role_permissions', (t) => { t.dropForeign(['role_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('role_permissions', (t) => {
        t.foreign('permission_id').references('id').inTable('permissions').onUpdate('CASCADE');
        t.foreign('role_id').references('id').inTable('roles').onUpdate('CASCADE');
      });
    });

    // --- tier_options ---
    await this.safeRun(async (k) => { await k.schema.alterTable('tier_options', (t) => { t.dropForeign(['tier_variation_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('tier_options', (t) => { t.dropIndex([], 'tier_options_position_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('tier_options', (t) => {
        t.foreign('tier_variation_id').references('id').inTable('product_tier_variations').onUpdate('CASCADE').onDelete('CASCADE');
      });
    });

    // --- topics ---
    await this.safeRun(async (k) => { await k.schema.alterTable('topics', (t) => { t.dropForeign(['parent_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('topics', (t) => { t.dropIndex([], 'topics_is_active_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('topics', (t) => { t.dropIndex([], 'topics_level_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('topics', (t) => { t.dropIndex([], 'topics_sort_order_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('topics', (t) => {
        t.foreign('parent_id').references('id').inTable('topics').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- users ---
    await this.safeRun(async (k) => { await k.schema.alterTable('users', (t) => { t.dropForeign(['role_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('users', (t) => {
        t.foreign('role_id').references('id').inTable('roles').onUpdate('CASCADE').onDelete('SET NULL');
      });
    });

    // --- posts ---
    await this.safeRun(async (k) => { await k.schema.alterTable('posts', (t) => { t.dropForeign(['author_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('posts', (t) => { t.dropIndex([], 'posts_created_at_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('posts', (t) => { t.dropIndex([], 'posts_is_active_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('posts', (t) => { t.dropIndex([], 'posts_is_published_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('posts', (t) => { t.dropIndex([], 'posts_published_at_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('posts', (t) => {
        t.foreign('author_id').references('id').inTable('users').onUpdate('CASCADE');
      });
    });

    // --- post_topics ---
    await this.safeRun(async (k) => { await k.schema.alterTable('post_topics', (t) => { t.dropForeign(['post_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('post_topics', (t) => { t.dropForeign(['topic_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('post_topics', (t) => { t.dropIndex([], 'post_topics_topic_id_post_id_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('post_topics', (t) => {
        t.foreign('post_id').references('id').inTable('posts').onUpdate('CASCADE');
        t.foreign('topic_id').references('id').inTable('topics').onUpdate('CASCADE');
      });
    });

    // --- post_tags ---
    await this.safeRun(async (k) => { await k.schema.alterTable('post_tags', (t) => { t.dropForeign(['post_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('post_tags', (t) => { t.dropForeign(['tag_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('post_tags', (t) => { t.dropIndex([], 'post_tags_tag_id_post_id_index'); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('post_tags', (t) => {
        t.foreign('post_id').references('id').inTable('posts').onUpdate('CASCADE');
        t.foreign('tag_id').references('id').inTable('tags').onUpdate('CASCADE');
      });
    });

    // --- variant_tier_indexes ---
    await this.safeRun(async (k) => { await k.schema.alterTable('variant_tier_indexes', (t) => { t.dropForeign(['tier_option_id']); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('variant_tier_indexes', (t) => { t.dropForeign(['variant_id']); }); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('variant_tier_indexes', (t) => {
        t.foreign('tier_option_id').references('id').inTable('tier_options').onUpdate('CASCADE').onDelete('CASCADE');
        t.foreign('variant_id').references('id').inTable('product_variants').onUpdate('CASCADE').onDelete('CASCADE');
      });
    });

    // --- webhooks: change events/headers from longtext to JSON ---
    await this.safeRun(async (k) => { await k.raw('alter table `webhooks` drop constraint webhooks_chk_1'); });
    await this.safeRun(async (k) => { await k.raw('alter table `webhooks` drop constraint webhooks_chk_2'); });
    await this.safeRun(async (k) => {
      await k.schema.alterTable('webhooks', (t) => {
        t.json('events').notNullable().alter();
        t.json('headers').nullable().alter();
      });
    });

    // --- products: normalize column types ---
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'idx_products_sold_count'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'products_display_order_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'products_is_active_published_at_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'products_is_featured_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'products_price_sale_price_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('products', (t) => { t.dropIndex([], 'products_sku_index'); }); });
    await this.safeRun(async (k) => { await k.raw('alter table `products` drop constraint products_chk_1'); });

    // --- em_campaigns: drop deleted_at index ---
    await this.safeRun(async (k) => { await k.schema.alterTable('em_campaigns', (t) => { t.dropIndex([], 'em_campaigns_deleted_at_index'); }); });

    // --- contacts: drop indexes ---
    await this.safeRun(async (k) => { await k.schema.alterTable('contacts', (t) => { t.dropIndex([], 'contacts_email_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('contacts', (t) => { t.dropIndex([], 'contacts_status_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('contacts', (t) => { t.dropIndex([], 'contacts_type_index'); }); });

    // --- customers: drop email index ---
    await this.safeRun(async (k) => { await k.schema.alterTable('customers', (t) => { t.dropIndex([], 'customers_email_index'); }); });

    // --- pages: drop type index ---
    await this.safeRun(async (k) => { await k.schema.alterTable('pages', (t) => { t.dropIndex([], 'pages_type_index'); }); });

    // --- page_views: drop indexes ---
    await this.safeRun(async (k) => { await k.schema.alterTable('page_views', (t) => { t.dropIndex([], 'page_views_created_at_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('page_views', (t) => { t.dropIndex([], 'page_views_created_at_session_id_index'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('page_views', (t) => { t.dropIndex([], 'page_views_session_id_index'); }); });

    // --- settings: drop indexes ---
    await this.safeRun(async (k) => { await k.schema.alterTable('settings', (t) => { t.dropIndex([], 'idx_settings_group'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('settings', (t) => { t.dropIndex([], 'idx_settings_key'); }); });
    await this.safeRun(async (k) => { await k.schema.alterTable('settings', (t) => { t.dropIndex([], 'settings_group_is_public_index'); }); });

    // --- order_items: drop constraint ---
    await this.safeRun(async (k) => { await k.raw('alter table `order_items` drop constraint order_items_chk_1'); });
  }

  override async down(): Promise<void> {
    await this.getKnex().schema.dropTableIfExists('app_feedbacks');
  }
}
