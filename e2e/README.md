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

The runner copies the workspace into an isolated container worktree before installing dependencies. This prevents Linux native Yarn builds from overwriting host-native `.yarn/unplugged` artifacts. When updating snapshots, it copies only `*-snapshots` files back to the workspace.

The container image is pinned to the same version as `@playwright/test` so it supplies the required Linux browser dependencies and browser revisions.
