#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

node scripts/export-follow-builders-json.mjs
node scripts/export-follow-builders-final-json.mjs
node scripts/render-follow-builders-digest.mjs
node scripts/export-follow-builders-lite.mjs
mkdir -p public/data/follow-builders
cp data/follow-builders/final-digest.json public/data/follow-builders/final-digest.json
cp data/follow-builders/latest-lite.json public/data/follow-builders/latest-lite.json

git add data/follow-builders public/data/follow-builders

if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi

git commit -m "Update follow-builders JSON export"
git push origin HEAD
