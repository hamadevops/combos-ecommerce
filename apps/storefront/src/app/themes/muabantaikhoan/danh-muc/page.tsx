// Route alias: /danh-muc → re-exports categories page
// This file exists so that /danh-muc resolves to the category listing page
// instead of being caught by the [slug] dynamic route (product detail).
export { default } from "../categories/page";
export { generateMetadata } from "../categories/page";
