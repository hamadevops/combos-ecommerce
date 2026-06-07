#!/usr/bin/env bash
set -e

# Change directory to project root
cd "$(dirname "$0")/.."

REGISTRY="127.0.0.1:8888"
PROJECT="library"
USERNAME="admin"
PASSWORD="Harbor12345"

echo "=== Logging in to Harbor Registry ($REGISTRY) ==="
docker login "$REGISTRY" -u "$USERNAME" -p "$PASSWORD"

echo "=== Building Backend Image ==="
docker build -t "$REGISTRY/$PROJECT/backend:latest" -f apps/backend/Dockerfile .

echo "=== Building Admin CMS Image ==="
docker build -t "$REGISTRY/$PROJECT/admin-cms:latest" -f apps/admin-cms/Dockerfile .

echo "=== Building Storefront Image ==="
docker build -t "$REGISTRY/$PROJECT/storefront:latest" -f apps/storefront/Dockerfile .

echo "=== Pushing Images to Harbor ==="
docker push "$REGISTRY/$PROJECT/backend:latest"
docker push "$REGISTRY/$PROJECT/admin-cms:latest"
docker push "$REGISTRY/$PROJECT/storefront:latest"

echo "=== Build and Push Completed Successfully! ==="
