#!/bin/sh
# Baseline reviewer for the evaluation set: the bare model with a fixed CLR
# prompt and no plugin skill. It is the score the CLR review skill must beat.
# It reads the case tree on standard input and prints findings.
#
#   node scripts/eval/run.mjs --model "$EVAL_MODEL" \
#     --reviewer "EVAL_MODEL=$EVAL_MODEL sh eval/reviewers/baseline.sh"
#
# The model runs with no tools, no MCP servers, no skills, and no project
# settings, from an empty folder, so it cannot read the answer keys.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
prompt=$(cat "$here/baseline-prompt.md")
tree=$(cat)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
cd "$work"
printf '%s\n' "$tree" | claude -p \
  --model "${EVAL_MODEL:?set EVAL_MODEL}" \
  --system-prompt "$prompt" \
  --tools "" \
  --strict-mcp-config \
  --setting-sources "" \
  --disable-slash-commands \
  --no-session-persistence
