# Watson

Watson is a browser-based, offline JVM thread dump and CPU usage analyzer.

![Watson threads overview](e2e/threads-overview.spec.tsx-snapshots/Threads-overview-loads-1-chrome-light-linux.png)

It helps investigate JVM performance problems by grouping similar threads, identifying stuck or CPU-heavy threads, showing monitor contention, visualising stack traces and flame graphs. Its filtering tools help focus the analysis on relevant data.

See [screenshots.md](screenshots.md) for examples of Watson's analysis views.

## Getting data

For the most useful analysis, capture both:

- Java thread dumps
- CPU usage output from `top`

For Atlassian products, the easiest option is to generate a [support zip](https://confluence.atlassian.com/support/create-a-support-zip-790796819.html) and load the files from:

```text
jfr-bundle/atst_in_product_diagnostic_<timestamp>/threaddumps
```

You can also collect data manually, including for non-Atlassian applications, with the [Atlassian Support scripts](https://bitbucket.org/atlassianlabs/atlassian-support/src/master/).

## Development

### Prerequisites

- Node.js 24 or later
- Docker, for end-to-end tests
- Corepack, included with supported Node.js releases

```bash
corepack enable
yarn install
```

### Run locally

```bash
yarn start
```

Open http://localhost:3000/ in a browser.

### Useful commands

| Command                                     | Description                                                   |
|---------------------------------------------|---------------------------------------------------------------|
| `yarn start`                                | Start the development server                                  |
| `yarn build`                                | Type-check and create a production build                      |
| `yarn lint`                                 | Run type checks and auto-fix lint and style issues            |
| `yarn test`                                 | Run unit tests in watch mode                                  |
| `yarn test:coverage`                        | Run unit tests once with coverage                             |
| `./e2e/run-in-docker.sh`                    | Run end-to-end tests in the pinned Linux Playwright container |
| `./e2e/run-in-docker.sh --update-snapshots` | Update visual-test snapshots in the same container used by CI |
| `yarn serve`                                | Preview an existing production build locally                  |

Before running or updating visual tests, fetch the committed screenshot baselines:

```bash
git lfs pull
```

See [e2e/README.md](e2e/README.md) for focused visual-test and benchmark commands.