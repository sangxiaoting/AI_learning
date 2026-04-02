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

# Step 2: Push to GitHub if remote is configured
if [ -n "${GITHUB_REMOTE:-}" ]; then
    echo "Pushing to GitHub..." | tee -a "$LOG_PATH"
    python3 "$SCRIPT_DIR/push_to_github.py" --remote "$GITHUB_REMOTE" 2>&1 | tee -a "$LOG_PATH"
fi

echo "Pipeline completed at $(date)" | tee -a "$LOG_PATH"
