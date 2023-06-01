To update snapshots used in CI (**execute from the parent directory**):
```
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:next-jammy /bin/bash
yarn install
yarn playwright test --update-snapshots
```

To update snapshots used on your local OS (**execute from the parent directory**):
```
yarn playwright test --update-snapshots
```

Source: https://playwright.dev/docs/test-snapshots
