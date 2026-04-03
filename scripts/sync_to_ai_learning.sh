#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_ROOT="${AI_LEARNING_ROOT:-/Users/sangxiaoting/.openclaw/workspace/AI_learning}"

SRC_DATA="$ROOT/data/youtube/"
SRC_CONTENT="$ROOT/content/youtube/"
SRC_TRANSCRIPTS="$ROOT/transcripts/youtube/"

DST_DATA="$TARGET_ROOT/public/data/youtube/"
DST_CONTENT="$TARGET_ROOT/public/content/youtube/"
DST_TRANSCRIPTS="$TARGET_ROOT/public/transcripts/youtube/"

mkdir -p "$DST_DATA" "$DST_CONTENT" "$DST_TRANSCRIPTS"

rsync -a --delete "$SRC_DATA" "$DST_DATA"
rsync -a --delete "$SRC_CONTENT" "$DST_CONTENT"
rsync -a --delete "$SRC_TRANSCRIPTS" "$DST_TRANSCRIPTS"

echo "Synced YouTube pipeline outputs to AI_learning/public"
