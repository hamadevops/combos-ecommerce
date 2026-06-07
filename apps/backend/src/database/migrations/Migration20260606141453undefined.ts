import { Migration } from '@mikro-orm/migrations';

export class Migration20260606141453 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`variant_attributes\` drop foreign key \`variant_attributes_attribute_value_id_foreign\`;`);

    this.addSql(`alter table \`attribute_values\` drop foreign key \`attribute_values_attribute_id_foreign\`;`);

    this.addSql(`alter table \`sc_videos\` drop foreign key \`sc_videos_channel_id_foreign\`;`);

    this.addSql(`alter table \`sc_downloaded_videos\` drop foreign key \`sc_downloaded_videos_video_id_foreign\`;`);

    this.addSql(`create table \`app_feedbacks\` (\`id\` int unsigned not null auto_increment primary key, \`customer_name\` varchar(255) null, \`customer_avatar\` varchar(255) null, \`content\` text null, \`rating\` int not null default 5, \`image\` varchar(500) null, \`is_active\` tinyint(1) not null default true, \`sort_order\` int not null default 0, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`drop table if exists \`attribute_values\`;`);

    this.addSql(`drop table if exists \`attributes\`;`);

    this.addSql(`drop table if exists \`sc_channels\`;`);

    this.addSql(`drop table if exists \`sc_downloaded_videos\`;`);

    this.addSql(`drop table if exists \`sc_videos\`;`);

    this.addSql(`drop table if exists \`variant_attributes\`;`);

    this.addSql(`alter table \`categories\` drop foreign key \`categories_parent_id_foreign\`;`);

    this.addSql(`alter table \`orders\` drop foreign key \`orders_customer_id_foreign\`;`);

    this.addSql(`alter table \`permissions\` drop foreign key \`permissions_group_id_foreign\`;`);

    this.addSql(`alter table \`product_categories\` drop foreign key \`product_categories_category_id_foreign\`;`);
    this.addSql(`alter table \`product_categories\` drop foreign key \`product_categories_product_id_foreign\`;`);

    this.addSql(`alter table \`product_images\` drop foreign key \`product_images_product_id_foreign\`;`);

    this.addSql(`alter table \`product_tier_variations\` drop foreign key \`product_tier_variations_product_id_foreign\`;`);

    this.addSql(`alter table \`product_variants\` drop foreign key \`product_variants_product_id_foreign\`;`);

    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_order_id_foreign\`;`);
    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_product_id_foreign\`;`);
    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_product_variant_id_foreign\`;`);

    this.addSql(`alter table \`reviews\` drop foreign key \`reviews_product_id_foreign\`;`);

    this.addSql(`alter table \`roles\` drop foreign key \`roles_parent_id_foreign\`;`);

    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_permission_id_foreign\`;`);
    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_role_id_foreign\`;`);

    this.addSql(`alter table \`tier_options\` drop foreign key \`tier_options_tier_variation_id_foreign\`;`);

    this.addSql(`alter table \`topics\` drop foreign key \`topics_parent_id_foreign\`;`);

    this.addSql(`alter table \`users\` drop foreign key \`users_role_id_foreign\`;`);

    this.addSql(`alter table \`posts\` drop foreign key \`posts_author_id_foreign\`;`);

    this.addSql(`alter table \`post_topics\` drop foreign key \`post_topics_post_id_foreign\`;`);
    this.addSql(`alter table \`post_topics\` drop foreign key \`post_topics_topic_id_foreign\`;`);

    this.addSql(`alter table \`post_tags\` drop foreign key \`post_tags_post_id_foreign\`;`);
    this.addSql(`alter table \`post_tags\` drop foreign key \`post_tags_tag_id_foreign\`;`);

    this.addSql(`alter table \`variant_tier_indexes\` drop foreign key \`variant_tier_indexes_tier_option_id_foreign\`;`);
    this.addSql(`alter table \`variant_tier_indexes\` drop foreign key \`variant_tier_indexes_variant_id_foreign\`;`);

    this.addSql(`alter table \`categories\` drop index \`categories_is_active_index\`;`);
    this.addSql(`alter table \`categories\` drop index \`categories_sort_order_index\`;`);

    this.addSql(`alter table \`categories\` modify \`is_active\` tinyint(1) not null default true, modify \`sort_order\` int not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`categories\` add constraint \`categories_parent_id_foreign\` foreign key (\`parent_id\`) references \`categories\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`contacts\` drop index \`contacts_email_index\`;`);
    this.addSql(`alter table \`contacts\` drop index \`contacts_status_index\`;`);
    this.addSql(`alter table \`contacts\` drop index \`contacts_type_index\`;`);

    this.addSql(`alter table \`customers\` drop index \`customers_email_index\`;`);

    this.addSql(`alter table \`customers\` modify \`total_spent\` numeric(15,2) not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`em_config\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`em_contacts\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`em_segments\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`em_contact_segments\` add index \`em_contact_segments_em_contact_id_index\`(\`em_contact_id\`);`);
    this.addSql(`alter table \`em_contact_segments\` rename index \`em_contact_segments_em_segment_id_foreign\` to \`em_contact_segments_em_segment_id_index\`;`);

    this.addSql(`alter table \`em_templates\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`em_campaigns\` drop index \`em_campaigns_deleted_at_index\`;`);

    this.addSql(`alter table \`em_campaigns\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`em_campaigns\` rename index \`em_campaigns_template_id_foreign\` to \`em_campaigns_template_id_index\`;`);

    this.addSql(`alter table \`em_email_logs\` modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`em_email_logs\` rename index \`em_email_logs_campaign_id_foreign\` to \`em_email_logs_campaign_id_index\`;`);

    this.addSql(`alter table \`em_campaign_segments\` add index \`em_campaign_segments_em_campaign_id_index\`(\`em_campaign_id\`);`);
    this.addSql(`alter table \`em_campaign_segments\` rename index \`em_campaign_segments_em_segment_id_foreign\` to \`em_campaign_segments_em_segment_id_index\`;`);

    this.addSql(`alter table \`em_tracked_links\` modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`em_tracked_links\` rename index \`em_tracked_links_campaign_id_foreign\` to \`em_tracked_links_campaign_id_index\`;`);

    this.addSql(`alter table \`em_link_clicks\` modify \`clicked_at\` datetime not null;`);
    this.addSql(`alter table \`em_link_clicks\` rename index \`em_link_clicks_email_log_id_foreign\` to \`em_link_clicks_email_log_id_index\`;`);
    this.addSql(`alter table \`em_link_clicks\` rename index \`em_link_clicks_tracked_link_id_foreign\` to \`em_link_clicks_tracked_link_id_index\`;`);

    this.addSql(`alter table \`faqs\` modify \`sort_order\` int not null default 0, modify \`is_active\` tinyint(1) not null default true, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`orders\` drop index \`orders_created_at_index\`;`);
    this.addSql(`alter table \`orders\` drop index \`orders_payment_status_index\`;`);
    this.addSql(`alter table \`orders\` drop index \`orders_status_index\`;`);

    this.addSql(`alter table \`orders\` modify \`code\` varchar(255) not null, modify \`total_amount\` numeric(15,2) not null default 0, modify \`shipping_fee\` numeric(15,2) not null default 0, modify \`discount_amount\` numeric(15,2) not null default 0, modify \`final_amount\` numeric(15,2) not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`orders\` add constraint \`orders_customer_id_foreign\` foreign key (\`customer_id\`) references \`customers\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`pages\` drop index \`pages_type_index\`;`);

    this.addSql(`alter table \`pages\` modify \`is_active\` tinyint(1) not null default true, modify \`type\` varchar(255) not null default 'standard', modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`page_views\` drop index \`page_views_created_at_index\`;`);
    this.addSql(`alter table \`page_views\` drop index \`page_views_created_at_session_id_index\`;`);
    this.addSql(`alter table \`page_views\` drop index \`page_views_session_id_index\`;`);

    this.addSql(`alter table \`page_views\` modify \`method\` varchar(10) not null default 'GET', modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`page_views\` modify \`session_id\` varchar(100) null;`);
    this.addSql(`alter table \`page_views\` modify \`path\` varchar(500) not null;`);
    this.addSql(`alter table \`page_views\` modify \`query_string\` varchar(1000) null;`);
    this.addSql(`alter table \`page_views\` modify \`referer\` varchar(500) null;`);
    this.addSql(`alter table \`page_views\` modify \`device_type\` varchar(20) null;`);
    this.addSql(`alter table \`page_views\` modify \`browser\` varchar(50) null;`);
    this.addSql(`alter table \`page_views\` modify \`os\` varchar(50) null;`);
    this.addSql(`alter table \`page_views\` modify \`country\` varchar(10) null;`);
    this.addSql(`alter table \`page_views\` modify \`response_time_ms\` int null;`);
    this.addSql(`alter table \`page_views\` modify \`status_code\` int null;`);

    this.addSql(`alter table \`permission_groups\` modify \`display_order\` int not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`permissions\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`permissions\` add constraint \`permissions_group_id_foreign\` foreign key (\`group_id\`) references \`permission_groups\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`permissions\` rename index \`permissions_group_id_foreign\` to \`permissions_group_id_index\`;`);

    this.addSql(`alter table \`popups\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`products\` drop index \`idx_products_sold_count\`;`);
    this.addSql(`alter table \`products\` drop index \`products_display_order_index\`;`);
    this.addSql(`alter table \`products\` drop index \`products_is_active_published_at_index\`;`);
    this.addSql(`alter table \`products\` drop index \`products_is_featured_index\`;`);
    this.addSql(`alter table \`products\` drop index \`products_price_sale_price_index\`;`);
    this.addSql(`alter table \`products\` drop index \`products_sku_index\`;`);
    this.addSql(`alter table \`products\` drop constraint products_chk_1;`);

    this.addSql(`alter table \`products\` modify \`description\` longtext, modify \`is_active\` int not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null, modify \`price\` numeric(12,2) not null, modify \`is_featured\` int not null default 0, modify \`specifications\` json, modify \`is_recommended\` int not null default 0;`);
    this.addSql(`alter table \`products\` modify \`display_order\` int not null default 0;`);

    this.addSql(`alter table \`product_categories\` drop index \`product_categories_category_id_product_id_index\`;`);
    this.addSql(`alter table \`product_categories\` drop column \`created_at\`, drop column \`updated_at\`;`);

    this.addSql(`alter table \`product_categories\` add constraint \`product_categories_category_id_foreign\` foreign key (\`category_id\`) references \`categories\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`product_categories\` add constraint \`product_categories_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`product_categories\` add index \`product_categories_product_id_index\`(\`product_id\`);`);
    this.addSql(`alter table \`product_categories\` add index \`product_categories_category_id_index\`(\`category_id\`);`);

    this.addSql(`alter table \`product_images\` drop index \`product_images_product_id_position_index\`;`);

    this.addSql(`alter table \`product_images\` modify \`position\` int not null default 0, modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`product_images\` add constraint \`product_images_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`product_images\` add index \`product_images_product_id_index\`(\`product_id\`);`);

    this.addSql(`alter table \`product_tier_variations\` drop index \`product_tier_variations_tier_index_index\`;`);

    this.addSql(`alter table \`product_tier_variations\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`product_tier_variations\` modify \`name\` varchar(255) not null;`);
    this.addSql(`alter table \`product_tier_variations\` modify \`tier_index\` tinyint not null default 0;`);
    this.addSql(`alter table \`product_tier_variations\` add constraint \`product_tier_variations_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`product_variants\` drop index \`product_variants_is_active_index\`;`);
    this.addSql(`alter table \`product_variants\` drop index \`product_variants_price_sale_price_index\`;`);

    this.addSql(`alter table \`product_variants\` modify \`price\` int not null, modify \`sale_price\` int, modify \`cost_price\` int, modify \`stock\` int not null default 0, modify \`is_active\` int not null default 1, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`product_variants\` modify \`name\` varchar(255) null;`);
    this.addSql(`alter table \`product_variants\` add constraint \`product_variants_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`order_items\` drop constraint order_items_chk_1;`);

    this.addSql(`alter table \`order_items\` modify \`variant_options\` json, modify \`quantity\` int not null, modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_product_variant_id_foreign\` foreign key (\`product_variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`order_items\` rename index \`order_items_product_variant_id_foreign\` to \`order_items_product_variant_id_index\`;`);

    this.addSql(`alter table \`product_videos\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null, modify \`is_visible\` int not null default 1;`);
    this.addSql(`alter table \`product_videos\` modify \`video_url\` varchar(255) not null;`);
    this.addSql(`alter table \`product_videos\` modify \`thumbnail_url\` varchar(255) null;`);
    this.addSql(`alter table \`product_videos\` modify \`display_order\` int not null default 0;`);
    this.addSql(`alter table \`product_videos\` rename index \`product_videos_product_id_foreign\` to \`product_videos_product_id_index\`;`);

    this.addSql(`alter table \`reviews\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`reviews\` add constraint \`reviews_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`roles\` modify \`is_default\` int not null default 1, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`roles\` add constraint \`roles_parent_id_foreign\` foreign key (\`parent_id\`) references \`roles\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`roles\` rename index \`roles_parent_id_foreign\` to \`roles_parent_id_index\`;`);

    this.addSql(`alter table \`role_permissions\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_permission_id_foreign\` foreign key (\`permission_id\`) references \`permissions\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`role_permissions\` add index \`role_permissions_role_id_index\`(\`role_id\`);`);
    this.addSql(`alter table \`role_permissions\` rename index \`role_permissions_permission_id_foreign\` to \`role_permissions_permission_id_index\`;`);

    this.addSql(`alter table \`settings\` drop index \`idx_settings_group\`;`);
    this.addSql(`alter table \`settings\` drop index \`idx_settings_key\`;`);
    this.addSql(`alter table \`settings\` drop index \`settings_group_is_public_index\`;`);

    this.addSql(`alter table \`settings\` modify \`type\` varchar(50) not null default 'string', modify \`is_public\` tinyint(1) not null default false, modify \`group\` varchar(50) not null default 'general', modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`tags\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);

    this.addSql(`alter table \`tier_options\` drop index \`tier_options_position_index\`;`);

    this.addSql(`alter table \`tier_options\` modify \`image_url\` varchar(255), modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`tier_options\` modify \`value\` varchar(255) not null;`);
    this.addSql(`alter table \`tier_options\` add constraint \`tier_options_tier_variation_id_foreign\` foreign key (\`tier_variation_id\`) references \`product_tier_variations\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`topics\` drop index \`topics_is_active_index\`;`);
    this.addSql(`alter table \`topics\` drop index \`topics_level_index\`;`);
    this.addSql(`alter table \`topics\` drop index \`topics_sort_order_index\`;`);

    this.addSql(`alter table \`topics\` modify \`is_active\` tinyint(1) not null default true, modify \`sort_order\` int not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`topics\` add constraint \`topics_parent_id_foreign\` foreign key (\`parent_id\`) references \`topics\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`users\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`users\` add constraint \`users_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`users\` rename index \`users_role_id_foreign\` to \`users_role_id_index\`;`);

    this.addSql(`alter table \`posts\` drop index \`posts_created_at_index\`;`);
    this.addSql(`alter table \`posts\` drop index \`posts_is_active_index\`;`);
    this.addSql(`alter table \`posts\` drop index \`posts_is_published_index\`;`);
    this.addSql(`alter table \`posts\` drop index \`posts_published_at_index\`;`);

    this.addSql(`alter table \`posts\` modify \`is_active\` tinyint(1) not null default false, modify \`is_published\` tinyint(1) not null default false, modify \`view_count\` int not null default 0, modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`posts\` add constraint \`posts_author_id_foreign\` foreign key (\`author_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`post_topics\` drop index \`post_topics_topic_id_post_id_index\`;`);

    this.addSql(`alter table \`post_topics\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`post_topics\` add constraint \`post_topics_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`post_topics\` add constraint \`post_topics_topic_id_foreign\` foreign key (\`topic_id\`) references \`topics\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`post_topics\` add index \`post_topics_post_id_index\`(\`post_id\`);`);
    this.addSql(`alter table \`post_topics\` add index \`post_topics_topic_id_index\`(\`topic_id\`);`);

    this.addSql(`alter table \`post_tags\` drop index \`post_tags_tag_id_post_id_index\`;`);

    this.addSql(`alter table \`post_tags\` modify \`created_at\` datetime not null, modify \`updated_at\` datetime not null;`);
    this.addSql(`alter table \`post_tags\` add constraint \`post_tags_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`post_tags\` add constraint \`post_tags_tag_id_foreign\` foreign key (\`tag_id\`) references \`tags\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`post_tags\` add index \`post_tags_post_id_index\`(\`post_id\`);`);
    this.addSql(`alter table \`post_tags\` add index \`post_tags_tag_id_index\`(\`tag_id\`);`);

    this.addSql(`alter table \`variant_tier_indexes\` modify \`created_at\` datetime not null;`);
    this.addSql(`alter table \`variant_tier_indexes\` modify \`tier_index\` tinyint not null;`);
    this.addSql(`alter table \`variant_tier_indexes\` add constraint \`variant_tier_indexes_tier_option_id_foreign\` foreign key (\`tier_option_id\`) references \`tier_options\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`variant_tier_indexes\` add constraint \`variant_tier_indexes_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`webhooks\` drop constraint webhooks_chk_1;`);
    this.addSql(`alter table \`webhooks\` drop constraint webhooks_chk_2;`);

    this.addSql(`alter table \`webhooks\` modify \`method\` varchar(255) not null default 'POST', modify \`events\` json not null, modify \`headers\` json;`);
  }

  override async down(): Promise<void> {
    this.addSql(`create table \`attribute_values\` (\`id\` int unsigned not null auto_increment primary key, \`attribute_id\` int unsigned not null, \`value\` varchar(255) not null, \`hex\` varchar(10) null, \`sort_order\` int not null default 0, \`is_active\` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`attribute_values\` add index \`attribute_values_attribute_id_value_index\`(\`attribute_id\`, \`value\`);`);
    this.addSql(`alter table \`attribute_values\` add unique \`uq_attribute_value\`(\`attribute_id\`, \`value\`);`);

    this.addSql(`create table \`attributes\` (\`id\` int unsigned not null auto_increment primary key, \`code\` varchar(255) not null, \`name\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`attributes\` add unique \`attributes_code_unique\`(\`code\`);`);

    this.addSql(`create table \`sc_channels\` (\`id\` int unsigned not null auto_increment primary key, \`platform\` enum('youtube', 'tiktok') not null, \`channel_id\` varchar(255) not null, \`name\` varchar(255) not null, \`description\` text null, \`thumbnail_url\` varchar(500) null, \`subscriber_count\` int null, \`video_count\` int null, \`custom_url\` varchar(255) null, \`last_sync_at\` datetime null, \`is_active\` tinyint(1) not null default true, \`metadata\` json null, \`created_at\` timestamp not null default CURRENT_TIMESTAMP, \`updated_at\` timestamp not null default CURRENT_TIMESTAMP) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sc_channels\` add index \`sc_channels_channel_id_index\`(\`channel_id\`);`);
    this.addSql(`alter table \`sc_channels\` add unique \`sc_channels_platform_channel_id_unique\`(\`platform\`, \`channel_id\`);`);

    this.addSql(`create table \`sc_downloaded_videos\` (\`id\` int unsigned not null auto_increment primary key, \`video_id\` int unsigned null, \`platform\` enum('youtube', 'tiktok') not null, \`source_video_id\` varchar(255) not null, \`title\` varchar(500) not null, \`duration\` int null, \`thumbnail_url\` varchar(500) null, \`quality\` varchar(20) null, \`video_file_url\` varchar(500) null, \`audio_file_url\` varchar(500) null, \`video_file_size\` bigint null, \`audio_file_size\` bigint null, \`subtitles\` json null, \`status\` enum('pending', 'downloading', 'completed', 'failed') not null default 'pending', \`error_message\` text null, \`downloaded_at\` datetime null, \`created_at\` timestamp not null default CURRENT_TIMESTAMP, \`updated_at\` timestamp not null default CURRENT_TIMESTAMP) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sc_downloaded_videos\` add index \`sc_downloaded_videos_source_video_id_index\`(\`source_video_id\`);`);
    this.addSql(`alter table \`sc_downloaded_videos\` add index \`sc_downloaded_videos_video_id_foreign\`(\`video_id\`);`);

    this.addSql(`create table \`sc_videos\` (\`id\` int unsigned not null auto_increment primary key, \`channel_id\` int unsigned not null, \`platform\` enum('youtube', 'tiktok') not null, \`video_id\` varchar(255) not null, \`title\` varchar(500) not null, \`description\` text null, \`thumbnail_url\` varchar(500) null, \`duration\` int null, \`view_count\` bigint null, \`like_count\` int null, \`comment_count\` int null, \`published_at\` datetime null, \`video_url\` varchar(500) not null, \`metadata\` json null, \`created_at\` timestamp not null default CURRENT_TIMESTAMP, \`updated_at\` timestamp not null default CURRENT_TIMESTAMP) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sc_videos\` add index \`sc_videos_channel_id_foreign\`(\`channel_id\`);`);
    this.addSql(`alter table \`sc_videos\` add index \`sc_videos_video_id_index\`(\`video_id\`);`);

    this.addSql(`create table \`variant_attributes\` (\`variant_id\` int unsigned not null, \`attribute_value_id\` int unsigned not null, primary key (\`variant_id\`, \`attribute_value_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`variant_attributes\` add index \`variant_attributes_attribute_value_id_variant_id_index\`(\`attribute_value_id\`, \`variant_id\`);`);

    this.addSql(`alter table \`attribute_values\` add constraint \`attribute_values_attribute_id_foreign\` foreign key (\`attribute_id\`) references \`attributes\` (\`id\`) on update no action on delete cascade;`);

    this.addSql(`alter table \`sc_downloaded_videos\` add constraint \`sc_downloaded_videos_video_id_foreign\` foreign key (\`video_id\`) references \`sc_videos\` (\`id\`) on update cascade on delete set null;`);

    this.addSql(`alter table \`sc_videos\` add constraint \`sc_videos_channel_id_foreign\` foreign key (\`channel_id\`) references \`sc_channels\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`variant_attributes\` add constraint \`variant_attributes_attribute_value_id_foreign\` foreign key (\`attribute_value_id\`) references \`attribute_values\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`variant_attributes\` add constraint \`variant_attributes_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update no action on delete cascade;`);

    this.addSql(`drop table if exists \`app_feedbacks\`;`);

    this.addSql(`alter table \`categories\` drop foreign key \`categories_parent_id_foreign\`;`);

    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_order_id_foreign\`;`);
    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_product_id_foreign\`;`);
    this.addSql(`alter table \`order_items\` drop foreign key \`order_items_product_variant_id_foreign\`;`);

    this.addSql(`alter table \`orders\` drop foreign key \`orders_customer_id_foreign\`;`);

    this.addSql(`alter table \`permissions\` drop foreign key \`permissions_group_id_foreign\`;`);

    this.addSql(`alter table \`post_tags\` drop foreign key \`post_tags_post_id_foreign\`;`);
    this.addSql(`alter table \`post_tags\` drop foreign key \`post_tags_tag_id_foreign\`;`);

    this.addSql(`alter table \`post_topics\` drop foreign key \`post_topics_post_id_foreign\`;`);
    this.addSql(`alter table \`post_topics\` drop foreign key \`post_topics_topic_id_foreign\`;`);

    this.addSql(`alter table \`posts\` drop foreign key \`posts_author_id_foreign\`;`);

    this.addSql(`alter table \`product_categories\` drop foreign key \`product_categories_product_id_foreign\`;`);
    this.addSql(`alter table \`product_categories\` drop foreign key \`product_categories_category_id_foreign\`;`);

    this.addSql(`alter table \`product_images\` drop foreign key \`product_images_product_id_foreign\`;`);

    this.addSql(`alter table \`product_tier_variations\` drop foreign key \`product_tier_variations_product_id_foreign\`;`);

    this.addSql(`alter table \`product_variants\` drop foreign key \`product_variants_product_id_foreign\`;`);

    this.addSql(`alter table \`reviews\` drop foreign key \`reviews_product_id_foreign\`;`);

    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_role_id_foreign\`;`);
    this.addSql(`alter table \`role_permissions\` drop foreign key \`role_permissions_permission_id_foreign\`;`);

    this.addSql(`alter table \`roles\` drop foreign key \`roles_parent_id_foreign\`;`);

    this.addSql(`alter table \`tier_options\` drop foreign key \`tier_options_tier_variation_id_foreign\`;`);

    this.addSql(`alter table \`topics\` drop foreign key \`topics_parent_id_foreign\`;`);

    this.addSql(`alter table \`users\` drop foreign key \`users_role_id_foreign\`;`);

    this.addSql(`alter table \`variant_tier_indexes\` drop foreign key \`variant_tier_indexes_variant_id_foreign\`;`);
    this.addSql(`alter table \`variant_tier_indexes\` drop foreign key \`variant_tier_indexes_tier_option_id_foreign\`;`);

    this.addSql(`alter table \`categories\` modify \`is_active\` tinyint(1) null default true, modify \`sort_order\` int null default 0, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`categories\` add constraint \`categories_parent_id_foreign\` foreign key (\`parent_id\`) references \`categories\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`categories\` add index \`categories_is_active_index\`(\`is_active\`);`);
    this.addSql(`alter table \`categories\` add index \`categories_sort_order_index\`(\`sort_order\`);`);

    this.addSql(`alter table \`contacts\` add index \`contacts_email_index\`(\`email\`);`);
    this.addSql(`alter table \`contacts\` add index \`contacts_status_index\`(\`status\`);`);
    this.addSql(`alter table \`contacts\` add index \`contacts_type_index\`(\`type\`);`);

    this.addSql(`alter table \`customers\` modify \`total_spent\` decimal(15,2) not null default 0.00, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`customers\` add index \`customers_email_index\`(\`email\`);`);

    this.addSql(`alter table \`em_campaign_segments\` drop index \`em_campaign_segments_em_campaign_id_index\`;`);

    this.addSql(`alter table \`em_campaign_segments\` rename index \`em_campaign_segments_em_segment_id_index\` to \`em_campaign_segments_em_segment_id_foreign\`;`);

    this.addSql(`alter table \`em_campaigns\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`em_campaigns\` add index \`em_campaigns_deleted_at_index\`(\`deleted_at\`);`);
    this.addSql(`alter table \`em_campaigns\` rename index \`em_campaigns_template_id_index\` to \`em_campaigns_template_id_foreign\`;`);

    this.addSql(`alter table \`em_config\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`em_contact_segments\` drop index \`em_contact_segments_em_contact_id_index\`;`);

    this.addSql(`alter table \`em_contact_segments\` rename index \`em_contact_segments_em_segment_id_index\` to \`em_contact_segments_em_segment_id_foreign\`;`);

    this.addSql(`alter table \`em_contacts\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`em_email_logs\` modify \`created_at\` datetime not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`em_email_logs\` rename index \`em_email_logs_campaign_id_index\` to \`em_email_logs_campaign_id_foreign\`;`);

    this.addSql(`alter table \`em_link_clicks\` modify \`clicked_at\` datetime not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`em_link_clicks\` rename index \`em_link_clicks_email_log_id_index\` to \`em_link_clicks_email_log_id_foreign\`;`);
    this.addSql(`alter table \`em_link_clicks\` rename index \`em_link_clicks_tracked_link_id_index\` to \`em_link_clicks_tracked_link_id_foreign\`;`);

    this.addSql(`alter table \`em_segments\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`em_templates\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`em_tracked_links\` modify \`created_at\` datetime not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`em_tracked_links\` rename index \`em_tracked_links_campaign_id_index\` to \`em_tracked_links_campaign_id_foreign\`;`);

    this.addSql(`alter table \`faqs\` modify \`sort_order\` int null default 0, modify \`is_active\` tinyint(1) null default true, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`order_items\` modify \`variant_options\` longtext, modify \`quantity\` int not null default 1, modify \`created_at\` timestamp null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_order_id_foreign\` foreign key (\`order_id\`) references \`orders\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`order_items\` add constraint \`order_items_product_variant_id_foreign\` foreign key (\`product_variant_id\`) references \`product_variants\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`order_items\` rename index \`order_items_product_variant_id_index\` to \`order_items_product_variant_id_foreign\`;`);
    this.addSql(`alter table \`order_items\` add constraint order_items_chk_1 check(json_valid(\`variant_options\`));`);

    this.addSql(`alter table \`orders\` modify \`code\` varchar(50) not null, modify \`total_amount\` decimal(15,2) not null default 0.00, modify \`shipping_fee\` decimal(15,2) not null default 0.00, modify \`discount_amount\` decimal(15,2) not null default 0.00, modify \`final_amount\` decimal(15,2) not null default 0.00, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`orders\` add constraint \`orders_customer_id_foreign\` foreign key (\`customer_id\`) references \`customers\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`orders\` add index \`orders_created_at_index\`(\`created_at\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_payment_status_index\`(\`payment_status\`);`);
    this.addSql(`alter table \`orders\` add index \`orders_status_index\`(\`status\`);`);

    this.addSql(`alter table \`page_views\` modify \`method\` varchar(10) null default 'GET', modify \`created_at\` timestamp null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`page_views\` modify \`session_id\` varchar(100) null comment 'Session ID để phân biệt unique visitors';`);
    this.addSql(`alter table \`page_views\` modify \`path\` varchar(500) not null comment 'URL path đã truy cập';`);
    this.addSql(`alter table \`page_views\` modify \`query_string\` varchar(1000) null comment 'Query parameters';`);
    this.addSql(`alter table \`page_views\` modify \`referer\` varchar(500) null comment 'Referer URL';`);
    this.addSql(`alter table \`page_views\` modify \`device_type\` varchar(20) null comment 'mobile / tablet / desktop';`);
    this.addSql(`alter table \`page_views\` modify \`browser\` varchar(50) null comment 'Tên browser';`);
    this.addSql(`alter table \`page_views\` modify \`os\` varchar(50) null comment 'Hệ điều hành';`);
    this.addSql(`alter table \`page_views\` modify \`country\` varchar(10) null comment 'Country code từ CF header';`);
    this.addSql(`alter table \`page_views\` modify \`response_time_ms\` int null comment 'Thời gian xử lý (ms)';`);
    this.addSql(`alter table \`page_views\` modify \`status_code\` int null comment 'HTTP status code';`);
    this.addSql(`alter table \`page_views\` add index \`page_views_created_at_index\`(\`created_at\`);`);
    this.addSql(`alter table \`page_views\` add index \`page_views_created_at_session_id_index\`(\`created_at\`, \`session_id\`);`);
    this.addSql(`alter table \`page_views\` add index \`page_views_session_id_index\`(\`session_id\`);`);

    this.addSql(`alter table \`pages\` modify \`is_active\` tinyint(1) null default true, modify \`type\` varchar(255) null default 'standard', modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`pages\` add index \`pages_type_index\`(\`type\`);`);

    this.addSql(`alter table \`permission_groups\` modify \`display_order\` int null default 0, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`permissions\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`permissions\` add constraint \`permissions_group_id_foreign\` foreign key (\`group_id\`) references \`permission_groups\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`permissions\` rename index \`permissions_group_id_index\` to \`permissions_group_id_foreign\`;`);

    this.addSql(`alter table \`popups\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`post_tags\` drop index \`post_tags_post_id_index\`;`);
    this.addSql(`alter table \`post_tags\` drop index \`post_tags_tag_id_index\`;`);

    this.addSql(`alter table \`post_tags\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`post_tags\` add constraint \`post_tags_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`post_tags\` add constraint \`post_tags_tag_id_foreign\` foreign key (\`tag_id\`) references \`tags\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`post_tags\` add index \`post_tags_tag_id_post_id_index\`(\`tag_id\`, \`post_id\`);`);

    this.addSql(`alter table \`post_topics\` drop index \`post_topics_post_id_index\`;`);
    this.addSql(`alter table \`post_topics\` drop index \`post_topics_topic_id_index\`;`);

    this.addSql(`alter table \`post_topics\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`post_topics\` add constraint \`post_topics_post_id_foreign\` foreign key (\`post_id\`) references \`posts\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`post_topics\` add constraint \`post_topics_topic_id_foreign\` foreign key (\`topic_id\`) references \`topics\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`post_topics\` add index \`post_topics_topic_id_post_id_index\`(\`topic_id\`, \`post_id\`);`);

    this.addSql(`alter table \`posts\` modify \`is_active\` tinyint(1) null default false, modify \`is_published\` tinyint(1) null default false, modify \`view_count\` int null default 0, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`posts\` add constraint \`posts_author_id_foreign\` foreign key (\`author_id\`) references \`users\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`posts\` add index \`posts_created_at_index\`(\`created_at\`);`);
    this.addSql(`alter table \`posts\` add index \`posts_is_active_index\`(\`is_active\`);`);
    this.addSql(`alter table \`posts\` add index \`posts_is_published_index\`(\`is_published\`);`);
    this.addSql(`alter table \`posts\` add index \`posts_published_at_index\`(\`published_at\`);`);

    this.addSql(`alter table \`product_categories\` drop index \`product_categories_product_id_index\`;`);
    this.addSql(`alter table \`product_categories\` drop index \`product_categories_category_id_index\`;`);

    this.addSql(`alter table \`product_categories\` add \`created_at\` timestamp not null default CURRENT_TIMESTAMP, add \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`product_categories\` add constraint \`product_categories_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`product_categories\` add constraint \`product_categories_category_id_foreign\` foreign key (\`category_id\`) references \`categories\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`product_categories\` add index \`product_categories_category_id_product_id_index\`(\`category_id\`, \`product_id\`);`);

    this.addSql(`alter table \`product_images\` drop index \`product_images_product_id_index\`;`);

    this.addSql(`alter table \`product_images\` modify \`position\` int null default 0, modify \`created_at\` timestamp null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`product_images\` add constraint \`product_images_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`product_images\` add index \`product_images_product_id_position_index\`(\`product_id\`, \`position\`);`);

    this.addSql(`alter table \`product_tier_variations\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`product_tier_variations\` modify \`name\` varchar(255) not null comment 'Tên tier: Màu sắc, Kích thước, Dung lượng';`);
    this.addSql(`alter table \`product_tier_variations\` modify \`tier_index\` tinyint not null default 0 comment '0 = tier1 (có ảnh), 1 = tier2';`);
    this.addSql(`alter table \`product_tier_variations\` add constraint \`product_tier_variations_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`product_tier_variations\` add index \`product_tier_variations_tier_index_index\`(\`tier_index\`);`);

    this.addSql(`alter table \`product_variants\` modify \`price\` decimal(12,2) not null, modify \`sale_price\` decimal(12,2), modify \`cost_price\` decimal(12,2), modify \`stock\` int null default 0, modify \`is_active\` tinyint(1) null default true, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`product_variants\` modify \`name\` varchar(255) null comment 'Tên hiển thị: Đỏ - XL';`);
    this.addSql(`alter table \`product_variants\` add constraint \`product_variants_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`product_variants\` add index \`product_variants_is_active_index\`(\`is_active\`);`);
    this.addSql(`alter table \`product_variants\` add index \`product_variants_price_sale_price_index\`(\`price\`, \`sale_price\`);`);

    this.addSql(`alter table \`product_videos\` modify \`is_visible\` tinyint not null default 1, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`product_videos\` modify \`video_url\` varchar(255) not null comment 'Đường dẫn tới file video hoặc link YouTube/TikTok';`);
    this.addSql(`alter table \`product_videos\` modify \`thumbnail_url\` varchar(255) null comment 'Đường dẫn ảnh bìa của video (có thể trống)';`);
    this.addSql(`alter table \`product_videos\` modify \`display_order\` int not null default 0 comment 'Thứ tự hiển thị video';`);
    this.addSql(`alter table \`product_videos\` rename index \`product_videos_product_id_index\` to \`product_videos_product_id_foreign\`;`);

    this.addSql(`alter table \`products\` modify \`description\` mediumtext, modify \`price\` decimal(12,2) not null default 0.00, modify \`is_active\` tinyint(1) null default true, modify \`is_featured\` tinyint(1) null default false, modify \`is_recommended\` tinyint not null default 0 comment 'Đánh dấu sản phẩm đề xuất', modify \`specifications\` longtext, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`products\` modify \`display_order\` int not null default 0 comment 'Thứ tự hiển thị sản phẩm';`);
    this.addSql(`alter table \`products\` add index \`idx_products_sold_count\`(\`sold_count\`);`);
    this.addSql(`alter table \`products\` add index \`products_display_order_index\`(\`display_order\`);`);
    this.addSql(`alter table \`products\` add index \`products_is_active_published_at_index\`(\`is_active\`, \`published_at\`);`);
    this.addSql(`alter table \`products\` add index \`products_is_featured_index\`(\`is_featured\`);`);
    this.addSql(`alter table \`products\` add index \`products_price_sale_price_index\`(\`price\`, \`sale_price\`);`);
    this.addSql(`alter table \`products\` add index \`products_sku_index\`(\`sku\`);`);
    this.addSql(`alter table \`products\` add constraint products_chk_1 check(json_valid(\`specifications\`));`);

    this.addSql(`alter table \`reviews\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`reviews\` add constraint \`reviews_product_id_foreign\` foreign key (\`product_id\`) references \`products\` (\`id\`) on update no action on delete cascade;`);

    this.addSql(`alter table \`role_permissions\` drop index \`role_permissions_role_id_index\`;`);

    this.addSql(`alter table \`role_permissions\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`role_permissions\` add constraint \`role_permissions_permission_id_foreign\` foreign key (\`permission_id\`) references \`permissions\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`role_permissions\` rename index \`role_permissions_permission_id_index\` to \`role_permissions_permission_id_foreign\`;`);

    this.addSql(`alter table \`roles\` modify \`is_default\` tinyint(1) not null default false, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`roles\` add constraint \`roles_parent_id_foreign\` foreign key (\`parent_id\`) references \`roles\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`roles\` rename index \`roles_parent_id_index\` to \`roles_parent_id_foreign\`;`);

    this.addSql(`alter table \`settings\` modify \`type\` varchar(255) null default 'string', modify \`is_public\` tinyint(1) null default false, modify \`group\` varchar(255) null default 'general', modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`settings\` add index \`idx_settings_group\`(\`group\`);`);
    this.addSql(`alter table \`settings\` add index \`idx_settings_key\`(\`key\`);`);
    this.addSql(`alter table \`settings\` add index \`settings_group_is_public_index\`(\`group\`, \`is_public\`);`);

    this.addSql(`alter table \`tags\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);

    this.addSql(`alter table \`tier_options\` modify \`image_url\` varchar(500) comment 'URL ảnh (chỉ dùng cho tier1)', modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`tier_options\` modify \`value\` varchar(255) not null comment 'Giá trị option: Đỏ, XL, 256GB';`);
    this.addSql(`alter table \`tier_options\` add constraint \`tier_options_tier_variation_id_foreign\` foreign key (\`tier_variation_id\`) references \`product_tier_variations\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`tier_options\` add index \`tier_options_position_index\`(\`position\`);`);

    this.addSql(`alter table \`topics\` modify \`is_active\` tinyint(1) null default true, modify \`sort_order\` int null default 0, modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`topics\` add constraint \`topics_parent_id_foreign\` foreign key (\`parent_id\`) references \`topics\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`topics\` add index \`topics_is_active_index\`(\`is_active\`);`);
    this.addSql(`alter table \`topics\` add index \`topics_level_index\`(\`level\`);`);
    this.addSql(`alter table \`topics\` add index \`topics_sort_order_index\`(\`sort_order\`);`);

    this.addSql(`alter table \`users\` modify \`created_at\` timestamp not null default CURRENT_TIMESTAMP, modify \`updated_at\` timestamp not null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`users\` add constraint \`users_role_id_foreign\` foreign key (\`role_id\`) references \`roles\` (\`id\`) on update no action on delete set null;`);
    this.addSql(`alter table \`users\` rename index \`users_role_id_index\` to \`users_role_id_foreign\`;`);

    this.addSql(`alter table \`variant_tier_indexes\` modify \`created_at\` timestamp null default CURRENT_TIMESTAMP;`);
    this.addSql(`alter table \`variant_tier_indexes\` modify \`tier_index\` tinyint not null comment '0 = tier1, 1 = tier2';`);
    this.addSql(`alter table \`variant_tier_indexes\` add constraint \`variant_tier_indexes_variant_id_foreign\` foreign key (\`variant_id\`) references \`product_variants\` (\`id\`) on update no action on delete cascade;`);
    this.addSql(`alter table \`variant_tier_indexes\` add constraint \`variant_tier_indexes_tier_option_id_foreign\` foreign key (\`tier_option_id\`) references \`tier_options\` (\`id\`) on update no action on delete cascade;`);

    this.addSql(`alter table \`webhooks\` modify \`method\` varchar(10) not null default 'POST', modify \`events\` longtext not null comment 'List of events to trigger the webhook. Example: ["order.created", "product.updated"]', modify \`headers\` longtext comment 'Custom headers to send with the webhook request. Example: {"Authorization": "Bearer token"}';`);
    this.addSql(`alter table \`webhooks\` add constraint webhooks_chk_1 check(json_valid(\`events\`));`);
    this.addSql(`alter table \`webhooks\` add constraint webhooks_chk_2 check(json_valid(\`headers\`));`);
  }

}
