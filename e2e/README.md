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

The container supplies the Linux browser dependencies. The `playwright install` command downloads the browser revisions required by the pinned `@playwright/test` package, because the matching `v1.62.0` container image is not yet available. See the upstream release-image issue: https://github.com/microsoft/playwright/issues/41987.
