## Running visual tests

The committed screenshots must be generated in the same Linux Playwright container used by CI. Do not create or update baselines on macOS.

Before comparing or updating snapshots, fetch the Git LFS images:

```
git lfs pull
```

To update snapshots, execute this from the repository root:

```
docker run --rm --network host -v $(pwd):/work -w /work/ -it mcr.microsoft.com/playwright:v1.61.1-noble /bin/bash
yarn install
HOME=/root yarn playwright install chromium firefox
HOME=/root yarn playwright test --update-snapshots
```

The container supplies the Linux browser dependencies. The `playwright install` command downloads the browser revisions required by the pinned `@playwright/test` package, because the matching `v1.62.0` container image is not yet available. See the upstream release-image issue: https://github.com/microsoft/playwright/issues/41987.

Run a focused component visual spec with:

```
yarn playwright test e2e/visual/components/time-window.visual.spec.tsx --update-snapshots
```
