#!/bin/bash

# Script to generate TypeScript types from OpenAPI spec
# Usage: ./scripts/generate-api.sh or npm run gen:api

set -e

API_URL="${API_URL:-http://localhost:3333}"
OUTPUT_FILE="src/docs/api-types.ts"

echo "📥 Generating TypeScript types from $API_URL/api/docs-json..."
npx openapi-typescript "$API_URL/api/docs-json" -o "$OUTPUT_FILE"

echo "✅ Types generated successfully in $OUTPUT_FILE"
echo ""
echo "Usage in your code:"
echo "  import type { components, operations } from '@/docs/api-types';"
echo ""
echo "  // Access schemas (DTOs)"
echo "  type Product = components['schemas']['ProductResponse'];"
echo "  type Category = components['schemas']['CategoryResponse'];"
