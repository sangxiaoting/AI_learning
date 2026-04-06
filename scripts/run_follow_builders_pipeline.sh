#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
LOG_DIR="$ROOT/logs"
LOG_FILE="$LOG_DIR/follow-builders-cron.log"
SKILL_DIR="$ROOT/skills/follow-builders"

mkdir -p "$LOG_DIR"

refresh_feed() {
  local name="$1"
  local url="$2"
  local target="$SKILL_DIR/$name"
  local tmp="${target}.tmp"

  if curl -fsSL --max-time 30 "$url" -o "$tmp"; then
    mv "$tmp" "$target"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Refreshed $name from central feed" | tee -a "$LOG_FILE"
  else
    rm -f "$tmp"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARN: Failed to refresh $name, keeping local copy" | tee -a "$LOG_FILE"
  fi
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting latest follow-builders pipeline" | tee -a "$LOG_FILE"
refresh_feed "feed-x.json" "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json"
refresh_feed "feed-podcasts.json" "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json"
refresh_feed "feed-blogs.json" "https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-blogs.json"
/usr/bin/env node "$ROOT/scripts/export-follow-builders-json.mjs" >> "$LOG_FILE" 2>&1
/usr/bin/env node "$ROOT/scripts/incremental-minimax-update.mjs" >> "$LOG_FILE" 2>&1
/usr/bin/env node "$ROOT/scripts/export-follow-builders-lite.mjs" >> "$LOG_FILE" 2>&1
mkdir -p "$ROOT/public/data/follow-builders"
cp "$ROOT/data/follow-builders/final-digest.json" "$ROOT/public/data/follow-builders/final-digest.json"
cp "$ROOT/data/follow-builders/latest-lite.json" "$ROOT/public/data/follow-builders/latest-lite.json"
/usr/bin/env zsh "$ROOT/scripts/push-follow-builders-json.sh" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Finished latest follow-builders pipeline" | tee -a "$LOG_FILE"
