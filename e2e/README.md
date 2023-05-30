To update snapshots for the CI:
```
docker run --rm --network host -v $(pwd):/work/ -w /work/ -it mcr.microsoft.com/playwright:v1.34.3-jammy /bin/bash
npm install
npx playwright test --update-snapshots
```

To update snapshots for your local OS (**execute from the parent directory**):
```
yarn playwright test --update-snapshots
```

Source: https://playwright.dev/docs/test-snapshots
