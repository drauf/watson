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
benchmark_mount=()
if [[ -n "${WATSON_BENCHMARK_DIR:-}" ]]; then
  if [[ ! -d "$WATSON_BENCHMARK_DIR" ]]; then
    echo "WATSON_BENCHMARK_DIR is not a directory: $WATSON_BENCHMARK_DIR" >&2
    exit 1
  fi
  benchmark_mount=(
    -v "$WATSON_BENCHMARK_DIR:/benchmark-fixture:ro"
    -e WATSON_BENCHMARK_DIR=/benchmark-fixture
  )
fi

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
  "${benchmark_mount[@]}" \
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
