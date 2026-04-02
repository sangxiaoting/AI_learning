#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SCRIPT_PATH="$ROOT/scripts/run_follow_builders_pipeline.sh"
LOG_PATH="$ROOT/logs/follow-builders-cron.log"
CRON_EXPR="0 9 * * *"

mkdir -p "$(dirname "$LOG_PATH")"
chmod +x "$SCRIPT_PATH"

echo "Setting up daily cron for follow-builders JSON export"
echo "Script: $SCRIPT_PATH"
echo "Log: $LOG_PATH"
echo "Schedule: $CRON_EXPR"

CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
NEW_ENTRY="$CRON_EXPR $SCRIPT_PATH >> $LOG_PATH 2>&1"

if printf '%s\n' "$CURRENT_CRON" | grep -F "$SCRIPT_PATH" >/dev/null 2>&1; then
  echo "Cron entry already exists."
  exit 0
fi

(
  printf '%s\n' "$CURRENT_CRON"
  printf '%s\n' "$NEW_ENTRY"
) | crontab -

echo "Cron added. To list: crontab -l"
echo "To remove: crontab -l | grep -v '$SCRIPT_PATH' | crontab -"
