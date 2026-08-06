#!/usr/bin/env bash
set -euo pipefail

readonly workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly worktree="$(mktemp -d "${TMPDIR:-/tmp}/watson-playwright.XXXXXX")"
readonly image="mcr.microsoft.com/playwright:v1.62.1-noble"

cleanup() {
  rm -rf "$worktree"
}
trap cleanup EXIT

copy_snapshots=false
for argument in "$@"; do
  if [[ "$argument" == --update-snapshots* ]]; then
    copy_snapshots=true
  fi
done

rsync -a \
  --exclude '.git' \
  --exclude '.yarn/unplugged' \
  --exclude 'dist' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  "$workspace_root/" "$worktree/"

docker run --rm \
  -v "$worktree:/work" \
  -w /work \
  "$image" \
  bash -lc 'yarn install --immutable && yarn playwright test "$@"' \
  -- "$@"

if "$copy_snapshots"; then
  rsync -a \
    --include '*/' \
    --include '*-snapshots/***' \
    --exclude '*' \
    "$worktree/e2e/" "$workspace_root/e2e/"
fi
