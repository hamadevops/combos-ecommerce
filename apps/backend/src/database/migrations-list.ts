import { Migration20251127152658CreateTableUser } from './migrations/Migration20251127152658_CreateTableUser';
import { Migration20251127165000CreateRBACTables } from './migrations/Migration20251127154811_CreateRBACTables';
import { Migration20251127170000CreateBaseRoles } from './migrations/Migration20251127155221_CreateBaseRoles';
import { Migration20251213135621CreateProductModule } from './migrations/Migration20251213135621_CreateProductModule';
import { Migration20251215160120AlterAttributeValuesAddFields } from './migrations/Migration20251215160120_alter_attribute_values_add_fields';
import { Migration20251225133700_CreateCategoriesTable } from './migrations/Migration20251225133700_CreateCategoriesTable';
import { Migration20251225133800_CreateProductCategoriesTable } from './migrations/Migration20251225133800_CreateProductCategoriesTable';
import { Migration20251225142100_CreateTopicsTable } from './migrations/Migration20251225142100_CreateTopicsTable';
import { Migration20251225142200_CreatePostsTable } from './migrations/Migration20251225142200_CreatePostsTable';
import { Migration20251225142300_CreateTagsTable } from './migrations/Migration20251225142300_CreateTagsTable';
import { Migration20251225142400_CreatePostTopicsTable } from './migrations/Migration20251225142400_CreatePostTopicsTable';
import { Migration20251225142500_CreatePostTagsTable } from './migrations/Migration20251225142500_CreatePostTagsTable';
import { Migration20251225214900_AddPriceStockToProducts } from './migrations/Migration20251225214900_AddPriceStockToProducts';
import { Migration20251226094954_CreatePopupsTable } from './migrations/Migration20251226094954_CreatePopupsTable';
import { Migration20251227111624CreateFaqPageSettingModules } from './migrations/Migration20251227111624_CreateFaqPageSettingModules';
import { Migration20251231220700AddUserProfileFields } from './migrations/Migration20251231220700_AddUserProfileFields';
import { Migration20260115021049_AddPopupTitleAndPromoCode } from './migrations/Migration20260115021049_AddPopupTitleAndPromoCode';
import { Migration20260118131626CreateReviewsTable } from './migrations/Migration20260118131626_CreateReviewsTable';
import { Migration20260126150000CreateTierBasedVariants } from './migrations/Migration20260126150000_CreateTierBasedVariants';
import { Migration20260129140848_AddRoleDescription } from './migrations/Migration20260129140848_AddRoleDescription';
import { Migration20260129220000_AddPhoneToUser } from './migrations/Migration20260129220000_AddPhoneToUser';
import { Migration20260131090000_CreateOrderSystem } from './migrations/Migration20260131090000_CreateOrderSystem';
import { Migration20260201224118_UpdateSettings } from './migrations/Migration20260201224118_UpdateSettings';
import { Migration20260202213000_CreateWebhooks } from './migrations/Migration20260202213000_CreateWebhooks';
import { Migration20260203142813AddSpecificationsToProducts } from './migrations/Migration20260203142813_AddSpecificationsToProducts';
import { Migration20260203230500_AddSoldCountToProducts } from './migrations/Migration20260203230500_AddSoldCountToProducts';
import { Migration20260327170103_CreateTableVideoProduct } from './migrations/Migration20260327170103CreateTableVideoProduct';
import { Migration20260328031020_AddColumnVisibleVideoProduct } from './migrations/Migration20260328031020AddColumnVisibleVideoProduct';
import { Migration20260401102900AddDisplayOrderToProducts } from './migrations/Migration20260401102900_AddDisplayOrderToProducts';
import { Migration20260401121500CreatePageViewsTable } from './migrations/Migration20260401121500_CreatePageViewsTable';
import { Migration20260401153500UpdatePermissions } from './migrations/Migration20260401153500_UpdatePermissions';
import { Migration20260401170000CreatePermissionGroups } from './migrations/Migration20260401170000_CreatePermissionGroups';
import { Migration20260403152600_AddUTMToOrders } from './migrations/Migration20260403152600AddUTMToOrders';
import { Migration20260414210000AddIsRecommendedToProducts } from './migrations/Migration20260414210000_AddIsRecommendedToProducts';
import { Migration20260418220000_CreateEmailMarketingTables } from './migrations/Migration20260418220000_CreateEmailMarketingTables';
import { Migration20260419102254_AddClickCountToEmailLogs } from './migrations/Migration20260419102254_AddClickCountToEmailLogs';
import { Migration20260419113600_AddCascadeDeleteToEmailMarketing } from './migrations/Migration20260419113600_AddCascadeDeleteToEmailMarketing';
import { Migration20260606181231_CreateContactsTable } from './migrations/Migration20260606181231_CreateContactsTable';
import { Migration20260606141453_SchemaSyncAndAppFeedbacks } from './migrations/Migration20260606141453_SchemaSyncAndAppFeedbacks';
import { Migration20260606155218_AddProductCascadeDelete } from './migrations/Migration20260606155218_AddProductCascadeDelete';
import { Migration20260606155622_AddProductSoftDelete } from './migrations/Migration20260606155622_AddProductSoftDelete';
import { Migration20260606230000_RedesignProductVariants } from './migrations/Migration20260606230000_RedesignProductVariants';

export const migrationsList = [
  // ... existing migrations
  {
    name: 'Migration20251127152658_CreateTableUser',
    class: Migration20251127152658CreateTableUser,
  },
  {
    name: 'Migration20251127154811_CreateRBACTables',
    class: Migration20251127165000CreateRBACTables,
  },
  {
    name: 'Migration20251127155221_CreateBaseRoles',
    class: Migration20251127170000CreateBaseRoles,
  },
  {
    name: 'Migration20251213135621_CreateProductModule',
    class: Migration20251213135621CreateProductModule,
  },
  {
    name: 'Migration20251215160120_alter_attribute_values_add_fields',
    class: Migration20251215160120AlterAttributeValuesAddFields,
  },
  {
    name: 'Migration20251225133700_CreateCategoriesTable',
    class: Migration20251225133700_CreateCategoriesTable,
  },
  {
    name: 'Migration20251225133800_CreateProductCategoriesTable',
    class: Migration20251225133800_CreateProductCategoriesTable,
  },
  {
    name: 'Migration20251225142100_CreateTopicsTable',
    class: Migration20251225142100_CreateTopicsTable,
  },
  {
    name: 'Migration20251225142200_CreatePostsTable',
    class: Migration20251225142200_CreatePostsTable,
  },
  {
    name: 'Migration20251225142300_CreateTagsTable',
    class: Migration20251225142300_CreateTagsTable,
  },
  {
    name: 'Migration20251225142400_CreatePostTopicsTable',
    class: Migration20251225142400_CreatePostTopicsTable,
  },
  {
    name: 'Migration20251225142500_CreatePostTagsTable',
    class: Migration20251225142500_CreatePostTagsTable,
  },
  {
    name: 'Migration20251225214900_AddPriceStockToProducts',
    class: Migration20251225214900_AddPriceStockToProducts,
  },
  {
    name: 'Migration20251226094954_CreatePopupsTable',
    class: Migration20251226094954_CreatePopupsTable,
  },
  {
    name: 'Migration20251227111624_CreateFaqPageSettingModules',
    class: Migration20251227111624CreateFaqPageSettingModules,
  },
  {
    name: 'Migration20251231220700_AddUserProfileFields',
    class: Migration20251231220700AddUserProfileFields,
  },
  {
    name: 'Migration20260115021049_AddPopupTitleAndPromoCode',
    class: Migration20260115021049_AddPopupTitleAndPromoCode,
  },
  {
    name: 'Migration20260118131626_CreateReviewsTable',
    class: Migration20260118131626CreateReviewsTable,
  },
  {
    name: 'Migration20260126150000_CreateTierBasedVariants',
    class: Migration20260126150000CreateTierBasedVariants,
  },
  {
    name: 'Migration20260129140848_AddRoleDescription',
    class: Migration20260129140848_AddRoleDescription,
  },
  {
    name: 'Migration20260129220000_AddPhoneToUser',
    class: Migration20260129220000_AddPhoneToUser,
  },
  {
    name: 'Migration20260131090000_CreateOrderSystem',
    class: Migration20260131090000_CreateOrderSystem,
  },
  {
    name: 'Migration20260201224118_UpdateSettings',
    class: Migration20260201224118_UpdateSettings,
  },
  {
    name: 'Migration20260202213000_CreateWebhooks',
    class: Migration20260202213000_CreateWebhooks,
  },
  {
    name: 'Migration20260203142813_AddSpecificationsToProducts',
    class: Migration20260203142813AddSpecificationsToProducts,
  },
  {
    name: 'Migration20260203230500_AddSoldCountToProducts',
    class: Migration20260203230500_AddSoldCountToProducts,
  },
  {
    name: 'Migration20260327170103_CreateTableVideoProduct',
    class: Migration20260327170103_CreateTableVideoProduct,
  },
  {
    name: 'Migration20260328031020_AddColumnVisibleVideoProduct',
    class: Migration20260328031020_AddColumnVisibleVideoProduct,
  },
  {
    name: 'Migration20260401102900_AddDisplayOrderToProducts',
    class: Migration20260401102900AddDisplayOrderToProducts,
  },
  {
    name: 'Migration20260401121500_CreatePageViewsTable',
    class: Migration20260401121500CreatePageViewsTable,
  },
  {
    name: 'Migration20260401153500_UpdatePermissions',
    class: Migration20260401153500UpdatePermissions,
  },
  {
    name: 'Migration20260401170000_CreatePermissionGroups',
    class: Migration20260401170000CreatePermissionGroups,
  },
  {
    name: 'Migration20260403152600_AddUTMToOrders',
    class: Migration20260403152600_AddUTMToOrders,
  },
  {
    name: 'Migration20260414210000_AddIsRecommendedToProducts',
    class: Migration20260414210000AddIsRecommendedToProducts,
  },
  {
    name: 'Migration20260418220000_CreateEmailMarketingTables',
    class: Migration20260418220000_CreateEmailMarketingTables,
  },
  {
    name: 'Migration20260419102254_AddClickCountToEmailLogs',
    class: Migration20260419102254_AddClickCountToEmailLogs,
  },
  {
    name: 'Migration20260419113600_AddCascadeDeleteToEmailMarketing',
    class: Migration20260419113600_AddCascadeDeleteToEmailMarketing,
  },
  {
    name: 'Migration20260606181231_CreateContactsTable',
    class: Migration20260606181231_CreateContactsTable,
  },
  {
    name: 'Migration20260606141453',
    class: Migration20260606141453_SchemaSyncAndAppFeedbacks,
  },
  {
    name: 'Migration20260606155218_AddProductCascadeDelete',
    class: Migration20260606155218_AddProductCascadeDelete,
  },
  {
    name: 'Migration20260606155622_AddProductSoftDelete',
    class: Migration20260606155622_AddProductSoftDelete,
  },
  {
    name: 'Migration20260606230000_RedesignProductVariants',
    class: Migration20260606230000_RedesignProductVariants,
  },
];
