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
copy_benchmark_trace=false
docker_arguments=(
  --rm
  -v "$worktree:/work"
  -w /work
)
if [[ -n "${WATSON_BENCHMARK_DIR:-}" ]]; then
  if [[ ! -d "$WATSON_BENCHMARK_DIR" ]]; then
    echo "WATSON_BENCHMARK_DIR is not a directory: $WATSON_BENCHMARK_DIR" >&2
    exit 1
  fi
  docker_arguments+=(
    -v "$WATSON_BENCHMARK_DIR:/benchmark-fixture:ro"
    -e WATSON_BENCHMARK_DIR=/benchmark-fixture
  )
fi

if [[ "${WATSON_BENCHMARK_TRACE:-}" == "1" ]]; then
  copy_benchmark_trace=true
  docker_arguments+=(
    -e WATSON_BENCHMARK_TRACE=1
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
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'playwright-report' \
  --exclude 'test-results' \
  --exclude 'benchmarks/local' \
  "$workspace_root/" "$worktree/"

docker run "${docker_arguments[@]}" \
  "$image" \
  bash -lc 'YARN_ENABLE_HARDENED_MODE=0 yarn install --immutable && yarn playwright test "$@"' \
  -- "$@"

if "$copy_snapshots"; then
  rsync -a \
    --include '*/' \
    --include '*-snapshots/***' \
    --exclude '*' \
    "$worktree/e2e/" "$workspace_root/e2e/"
fi

if "$copy_benchmark_trace"; then
  rsync -a \
    --include '*/' \
    --include 'parser-performance-trace.json' \
    --exclude '*' \
    "$worktree/test-results/" "$workspace_root/test-results/"
fi
