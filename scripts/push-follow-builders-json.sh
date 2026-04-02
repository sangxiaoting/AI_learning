#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

node scripts/export-follow-builders-json.mjs

git add data/follow-builders

if git diff --cached --quiet; then
  echo "No changes to commit"
  exit 0
fi

git commit -m "Update follow-builders JSON export"
git push origin HEAD
