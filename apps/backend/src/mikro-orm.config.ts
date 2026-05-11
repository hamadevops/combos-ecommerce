import { Migrator, TSMigrationGenerator } from '@mikro-orm/migrations';
import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { config } from 'dotenv';
import { join } from 'path';
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Permission } from './database/entities/permission.entity';
import { RolePermission } from './database/entities/role-permission.entity';
import { Product } from './database/entities/product.entity';
import { ProductImage } from './database/entities/product-image.entity';
import { ProductVariant } from './database/entities/product-variant.entity';
import { ProductTierVariation } from './database/entities/product-tier-variation.entity';
import { TierOption } from './database/entities/tier-option.entity';
import { VariantTierIndex } from './database/entities/variant-tier-index.entity';

import { Category } from './database/entities/category.entity';
import { ProductCategory } from './database/entities/product-category.entity';
import { Topic } from './database/entities/topic.entity';
import { Post } from './database/entities/post.entity';
import { Tag } from './database/entities/tag.entity';
import { PostTopic } from './database/entities/post-topic.entity';
import { PostTag } from './database/entities/post-tag.entity';
import { Popup } from './database/entities/popup.entity';
import { Faq } from './database/entities/faq.entity';
import { Page } from './database/entities/page.entity';
import { Setting } from './database/entities/setting.entity';
import { Review } from './database/entities/review.entity';
import { Customer } from './database/entities/customer.entity';
import { Order } from './database/entities/order.entity';
import { OrderItem } from './database/entities/order-item.entity';
import { Webhook } from './database/entities/webhook.entity';
import { migrationsList } from './database/migrations-list';
import { PageView } from './database/entities/page-view.entity';
import { EmCampaign } from './database/entities/email-marketing/em-campaign.entity';
import { EmConfig } from './database/entities/email-marketing/em-config.entity';
import { EmContact } from './database/entities/email-marketing/em-contact.entity';
import { EmEmailLog } from './database/entities/email-marketing/em-email-log.entity';
import { EmLinkClick } from './database/entities/email-marketing/em-link-click.entity';
import { EmSegment } from './database/entities/email-marketing/em-segment.entity';
import { EmTemplate } from './database/entities/email-marketing/em-template.entity';
import { EmTrackedLink } from './database/entities/email-marketing/em-tracked-link.entity';

config();

const MikroOrmConfig: Options<MySqlDriver> = {
  entities: [
    User,
    Role,
    Permission,
    RolePermission,
    Product,
    ProductImage,
    ProductVariant,
    ProductTierVariation,
    TierOption,
    VariantTierIndex,

    Category,
    ProductCategory,
    Topic,
    Post,
    Tag,
    PostTopic,
    PostTag,
    Popup,
    Faq,
    Page,
    Setting,
    Review,
    Customer,
    Order,
    OrderItem,
    Webhook,
    PageView,
    EmCampaign,
    EmConfig,
    EmContact,
    EmEmailLog,
    EmLinkClick,
    EmSegment,
    EmTemplate,
    EmTrackedLink,
  ],
  entitiesTs: [
    User,
    Role,
    Permission,
    RolePermission,
    Product,
    ProductImage,
    ProductVariant,
    ProductTierVariation,
    TierOption,
    VariantTierIndex,

    Category,
    ProductCategory,
    Topic,
    Post,
    Tag,
    PostTopic,
    PostTag,
    Popup,
    Faq,
    Page,
    Setting,
    Review,
    Customer,
    Order,
    OrderItem,
    Webhook,
    PageView,
    EmCampaign,
    EmConfig,
    EmContact,
    EmEmailLog,
    EmLinkClick,
    EmSegment,
    EmTemplate,
    EmTrackedLink,
  ],
  dbName: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  driver: MySqlDriver,
  migrations: {
    migrationsList: migrationsList,
    tableName: 'migrations',
    path: join(__dirname, 'database', 'migrations'),
    pathTs: join(__dirname, 'database', 'migrations'),
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
    emit: 'ts',
    generator: TSMigrationGenerator,
    fileName: (timestamp: string, name?: string) =>
      `Migration${timestamp}${name}`,
  },
  seeder: {
    path: 'src/database/seeders',
  },
  extensions: [Migrator],
};

export default MikroOrmConfig;
