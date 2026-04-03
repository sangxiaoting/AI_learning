#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."
SCRIPT_DIR="$(pwd)/scripts"
LOG_PATH="$(pwd)/logs/run-$(date +%Y%m%d-%H%M%S).log"

mkdir -p "$(dirname "$LOG_PATH")"

echo "Starting YouTube pipeline at $(date)" | tee -a "$LOG_PATH"

# Step 1: Run the pipeline
if [ -z "${MINIMAX_API_KEY:-}" ]; then
    echo "ERROR: MINIMAX_API_KEY is not set" | tee -a "$LOG_PATH"
    exit 1
fi

python3 "$SCRIPT_DIR/run_pipeline.py" --limit-per-channel 1 2>&1 | tee -a "$LOG_PATH"

# Step 2: Sync generated outputs into the real frontend repo
if [ -d "${AI_LEARNING_ROOT:-/Users/sangxiaoting/.openclaw/workspace/AI_learning}" ]; then
    echo "Syncing outputs to AI_learning..." | tee -a "$LOG_PATH"
    bash "$SCRIPT_DIR/sync_to_ai_learning.sh" 2>&1 | tee -a "$LOG_PATH"
fi

# Step 3: Commit + push the frontend repo if remote is configured
if [ -n "${GITHUB_REMOTE:-}" ]; then
    echo "Pushing AI_learning frontend repo..." | tee -a "$LOG_PATH"
    python3 "$SCRIPT_DIR/push_ai_learning.py" --repo "${AI_LEARNING_ROOT:-/Users/sangxiaoting/.openclaw/workspace/AI_learning}" 2>&1 | tee -a "$LOG_PATH"
fi

echo "Pipeline completed at $(date)" | tee -a "$LOG_PATH"
