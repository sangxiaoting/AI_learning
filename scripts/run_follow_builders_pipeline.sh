#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
LOG_DIR="$ROOT/logs"
LOG_FILE="$LOG_DIR/follow-builders-cron.log"

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting latest follow-builders pipeline" | tee -a "$LOG_FILE"
/usr/bin/env node "$ROOT/scripts/export-follow-builders-json.mjs" >> "$LOG_FILE" 2>&1
/usr/bin/env node "$ROOT/scripts/incremental-minimax-update.mjs" >> "$LOG_FILE" 2>&1
/usr/bin/env node "$ROOT/scripts/export-follow-builders-lite.mjs" >> "$LOG_FILE" 2>&1
mkdir -p "$ROOT/public/data/follow-builders"
cp "$ROOT/data/follow-builders/final-digest.json" "$ROOT/public/data/follow-builders/final-digest.json"
cp "$ROOT/data/follow-builders/latest-lite.json" "$ROOT/public/data/follow-builders/latest-lite.json"
/usr/bin/env zsh "$ROOT/scripts/push-follow-builders-json.sh" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Finished latest follow-builders pipeline" | tee -a "$LOG_FILE"
