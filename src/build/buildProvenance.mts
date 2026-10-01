import { execFileSync } from 'node:child_process';

type Environment = Readonly<Record<string, string | undefined>>;
type GitCommand = (args: readonly string[]) => string | undefined;

export interface BuildProvenance {
  revision: string;
  commitTime: string;
  buildTime: string;
}

const readGit = (args: readonly string[]): string | undefined => {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || undefined;
  } catch {
    return undefined;
  }
};

const readEnvironmentValue = (environment: Environment, name: string): string | undefined => (
  environment[name]?.trim() || undefined
);

const normalizeTime = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  const time = new Date(value);
  return Number.isNaN(time.getTime()) ? undefined : time.toISOString();
};

export const getBuildProvenance = (
  environment: Environment = process.env,
  git: GitCommand = readGit,
  now: Date = new Date(),
): BuildProvenance => ({
  revision: readEnvironmentValue(environment, 'WATSON_REVISION')
    ?? readEnvironmentValue(environment, 'GITHUB_SHA')
    ?? readEnvironmentValue(environment, 'BITBUCKET_COMMIT')
    ?? git(['rev-parse', 'HEAD'])
    ?? 'unknown',
  commitTime: normalizeTime(
    readEnvironmentValue(environment, 'WATSON_COMMIT_TIME')
      ?? git(['show', '-s', '--format=%cI', 'HEAD']),
  ) ?? 'unknown',
  buildTime: normalizeTime(
    readEnvironmentValue(environment, 'WATSON_BUILD_TIME'),
  ) ?? now.toISOString(),
});
