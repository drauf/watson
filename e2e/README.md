The baseline snapshot PNGs are stored in git-lfs. Before running the tests locally, run `git lfs pull` to fetch them - otherwise they stay as pointer stubs and every visual comparison fails.

To update snapshots used in CI (**execute from the parent directory**):
```
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.61.1-noble /bin/bash
yarn install
yarn playwright test --update-snapshots
```

When running locally, you'll need to also run `yarn playwright install --with-deps` to install required browsers

You can also run tests using filters, e.g. `yarn playwright test --update-snapshots changed theme-switcher.spec.tsx`
