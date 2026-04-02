#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_DIR="$ROOT_DIR/skills/follow-builders"

if [ ! -d "$SKILL_DIR" ]; then
  echo "follow-builders skill not found at: $SKILL_DIR" >&2
  exit 1
fi

cd "$SKILL_DIR/scripts"
node prepare-digest.js "$@"
