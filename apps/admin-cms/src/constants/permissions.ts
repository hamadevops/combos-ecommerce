/**
 * Permission keys for the application
 * Format: RESOURCE_ACTION
 */
export enum PermissionEnum {
  // Product permissions
  PRODUCT_CREATE = 'product.create',
  PRODUCT_READ = 'product.read',
  PRODUCT_UPDATE = 'product.update',
  PRODUCT_DELETE = 'product.delete',

  // User permissions
  USER_CREATE = 'user.create',
  USER_READ = 'user.read',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_UPDATE_ROLE = 'user.update.role',
  USER_READ_PROFILE = 'user.profile',

  // Role permissions
  ROLE_CREATE = 'role.create',
  ROLE_READ = 'role.read',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',

  // Permission permissions
  PERMISSION_CREATE = 'permission.create',
  PERMISSION_READ = 'permission.read',
  PERMISSION_UPDATE = 'permission.update',
  PERMISSION_DELETE = 'permission.delete',
  PERMISSION_ASSIGN = 'permission.assign',
  PERMISSION_REVOKE = 'permission.revoke',

  // Upload permissions
  UPLOAD_FILE = 'upload.file',

  // Category permissions
  CATEGORY_CREATE = 'category.create',
  CATEGORY_READ = 'category.read',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',

  // Topic permissions
  TOPIC_CREATE = 'topic.create',
  TOPIC_READ = 'topic.read',
  TOPIC_UPDATE = 'topic.update',
  TOPIC_DELETE = 'topic.delete',

  // Post permissions
  POST_CREATE = 'post.create',
  POST_READ = 'post.read',
  POST_UPDATE = 'post.update',
  POST_DELETE = 'post.delete',
  POST_PUBLISH = 'post.publish',

  // Tag permissions
  TAG_CREATE = 'tag.create',
  TAG_READ = 'tag.read',
  TAG_UPDATE = 'tag.update',
  TAG_DELETE = 'tag.delete',

  // Cache permissions
  CACHE_MANAGE = 'cache.manage',

  // FAQ permissions
  FAQ_CREATE = 'faq.create',
  FAQ_READ = 'faq.read',
  FAQ_UPDATE = 'faq.update',
  FAQ_DELETE = 'faq.delete',

  // Page permissions
  PAGE_CREATE = 'page.create',
  PAGE_READ = 'page.read',
  PAGE_UPDATE = 'page.update',
  PAGE_DELETE = 'page.delete',

  // Setting permissions
  SETTING_CREATE = 'setting.create',
  SETTING_READ = 'setting.read',
  SETTING_UPDATE = 'setting.update',
  SETTING_DELETE = 'setting.delete',
  // Review permissions
  REVIEW_CREATE = 'review.create',
  REVIEW_READ = 'review.read',
  REVIEW_UPDATE = 'review.update',
  REVIEW_DELETE = 'review.delete',

  // Order permissions
  ORDER_CREATE = 'order.create',
  ORDER_READ = 'order.read',
  ORDER_UPDATE = 'order.update',
  ORDER_DELETE = 'order.delete',

  // Customer permissions
  CUSTOMER_CREATE = 'customer.create',
  CUSTOMER_READ = 'customer.read',
  CUSTOMER_UPDATE = 'customer.update',
  CUSTOMER_DELETE = 'customer.delete',

  // Popup permissions
  POPUP_CREATE = 'popup.create',
  POPUP_READ = 'popup.read',
  POPUP_UPDATE = 'popup.update',
  POPUP_DELETE = 'popup.delete',
  // Webhook permissions
  WEBHOOK_READ = 'webhook.read',
  WEBHOOK_CREATE = 'webhook.create',
  WEBHOOK_UPDATE = 'webhook.update',
  WEBHOOK_DELETE = 'webhook.delete',

  // Dashboard permissions
  DASHBOARD_VIEW = 'dashboard.view',
}
