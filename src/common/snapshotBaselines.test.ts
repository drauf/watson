import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const E2E_ROOT = path.join(REPO_ROOT, 'e2e');
const COMPONENT_SNAPSHOT_ROOT = path.join(E2E_ROOT, 'visual', 'components');
const SNAPSHOT_DIRECTORY_SUFFIX = '-snapshots';
const SNAPSHOT_PROJECT_SUFFIX = /-(?:chrome|firefox)-(?:light|dark)(?:-components)?-linux\.png$/;

const findSnapshotDirectories = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (!entry.isDirectory()) {
      return [];
    }
    if (entry.name.endsWith(SNAPSHOT_DIRECTORY_SUFFIX)) {
      return [entryPath];
    }
    return findSnapshotDirectories(entryPath);
  });

const getSpecificationPath = (snapshotDirectory: string): string => {
  const specificationPath = snapshotDirectory.slice(0, -SNAPSHOT_DIRECTORY_SUFFIX.length);
  if (fs.existsSync(specificationPath)) {
    return specificationPath;
  }

  return path.join(COMPONENT_SNAPSHOT_ROOT, path.basename(specificationPath));
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getScreenshotPatterns = (specificationPath: string): RegExp[] => {
  const source = fs.readFileSync(specificationPath, 'utf-8');

  return [
    ...source.matchAll(/toHaveScreenshot\(\s*['"]([^'"]+)['"]/g),
  ].map((match) => new RegExp(`^${escapeRegExp(match[1].replace(/\.png$/, ''))}$`));
};

describe('visual snapshot baselines', () => {
  it('keeps every snapshot directory attached to an existing specification', () => {
    const orphanedDirectories = findSnapshotDirectories(E2E_ROOT)
      .filter((snapshotDirectory) => !fs.existsSync(getSpecificationPath(snapshotDirectory)));

    expect(orphanedDirectories).toEqual([]);
  });

  it('keeps only source-referenced screenshot baselines', () => {
    const staleSnapshots = findSnapshotDirectories(E2E_ROOT).flatMap((snapshotDirectory) => {
      const specificationPath = getSpecificationPath(snapshotDirectory);
      const namedPatterns = getScreenshotPatterns(specificationPath);

      return fs.readdirSync(snapshotDirectory)
        .filter((file) => file.endsWith('.png'))
        .filter((file) => {
          const screenshotName = file.replace(SNAPSHOT_PROJECT_SUFFIX, '');
          return !namedPatterns.some((pattern) => pattern.test(screenshotName));
        })
        .map((file) => path.relative(REPO_ROOT, path.join(snapshotDirectory, file)));
    });

    expect(staleSnapshots).toEqual([]);
  });
});
