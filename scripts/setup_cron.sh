#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
SCRIPT_PATH="$(pwd)/scripts/run_pipeline.py"
LOG_PATH="$(pwd)/logs/cron.log"

echo "Setting up daily cron for YouTube pipeline"
echo "Script: $SCRIPT_PATH"
echo "Log: $LOG_PATH"

mkdir -p "$(dirname "$LOG_PATH")"

# Add to OpenClaw cron
openclaw cron add \
  --name "youtube-pipeline" \
  --schedule "0 9,15 * * *" \
  --command "cd /Users/sangxiaoting/.openclaw/workspace && /usr/bin/env MINIMAX_API_KEY='$MINIMAX_API_KEY' python3 $SCRIPT_PATH >> $LOG_PATH 2>&1" \
  --description "Daily YouTube video monitoring and summarization"

echo "Cron added. To list: openclaw cron list"
echo "To remove: openclaw cron remove --name youtube-pipeline"
