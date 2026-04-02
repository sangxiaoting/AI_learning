#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
ENV_FILE="$ROOT/.env.local"
LOG_DIR="$ROOT/logs"
LOG_FILE="$LOG_DIR/cron.log"

mkdir -p "$LOG_DIR"

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

if [ -z "${MINIMAX_API_KEY:-}" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: MINIMAX_API_KEY is not set" | tee -a "$LOG_FILE"
  exit 1
fi

if [ -z "${GITHUB_REMOTE:-}" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: GITHUB_REMOTE is not set" | tee -a "$LOG_FILE"
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting scheduled YouTube pipeline" | tee -a "$LOG_FILE"
bash "$ROOT/scripts/run_full_pipeline.sh" >> "$LOG_FILE" 2>&1
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Finished scheduled YouTube pipeline" | tee -a "$LOG_FILE"
