## Running visual tests

The committed screenshots must be generated in the same Linux Playwright container used by CI. Do not create or update baselines on macOS.

Before comparing or updating snapshots, fetch the Git LFS images:

```
git lfs pull
```

Run visual tests from the repository root:

```
./e2e/run-in-docker.sh
```

Update snapshots with:

```
./e2e/run-in-docker.sh --update-snapshots
```

Run a focused component visual spec with:

```
./e2e/run-in-docker.sh e2e/visual/components/time-window.visual.spec.tsx --update-snapshots
```

## Benchmarks

### Parser browser benchmark

Set `WATSON_BENCHMARK_DIR` to a real capture directory, then run the Chromium benchmark in the same pinned container. The fixture is mounted read-only and is not copied into the worktree.

```
WATSON_BENCHMARK_DIR=/path/to/threaddumps \
  ./e2e/run-in-docker.sh e2e/parser-performance.spec.ts --project=chrome-light --workers=1
```

The benchmark prints JSON with first-progress, parser and storage durations, route-ready and post-storage render timings, plus Chromium long tasks measured from upload start. `inputBytes` is the logical fixture size.

To capture a Chromium trace for CPU and garbage-collection analysis, add `WATSON_BENCHMARK_TRACE=1`. The runner copies `parser-performance-trace.json` into `test-results/` after the run.

```
WATSON_BENCHMARK_DIR=/path/to/threaddumps \
WATSON_BENCHMARK_TRACE=1 \
  ./e2e/run-in-docker.sh e2e/parser-performance.spec.ts --project=chrome-light --workers=1
```
The runner copies the workspace into an isolated container worktree before installing dependencies. This prevents Linux native Yarn builds from overwriting host-native `.yarn/unplugged` artifacts. When updating snapshots, it copies only `*-snapshots` files back to the workspace.

The container image is pinned to the same version as `@playwright/test` so it supplies the required Linux browser dependencies and browser revisions.
