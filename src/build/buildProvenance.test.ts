import {
  describe, expect, it, vi,
} from 'vitest';
import { getBuildProvenance } from './buildProvenance.mjs';

const buildTime = new Date('2026-10-01T12:24:00Z');

describe('build provenance', () => {
  it('reads Git metadata and normalizes timestamps to UTC', () => {
    const git = vi.fn((args: readonly string[]) => {
      if (args[0] === 'rev-parse') return 'a87b1486b7b4b9e11c0336b675e393faa1c870f3';
      if (args[0] === 'show') return '2026-10-01T10:01:05+02:00';
      return undefined;
    });

    expect(getBuildProvenance({}, git, buildTime)).toEqual({
      revision: 'a87b1486b7b4b9e11c0336b675e393faa1c870f3',
      commitTime: '2026-10-01T08:01:05.000Z',
      buildTime: '2026-10-01T12:24:00.000Z',
    });
  });

  it('prefers explicit Watson metadata over CI and Git values', () => {
    const git = vi.fn(() => 'git-value');

    expect(getBuildProvenance({
      WATSON_REVISION: 'watson-revision',
      GITHUB_SHA: 'github-revision',
      BITBUCKET_COMMIT: 'bitbucket-revision',
      WATSON_COMMIT_TIME: '2026-09-30T23:00:00-01:00',
      WATSON_BUILD_TIME: '2026-10-01T14:00:00+02:00',
    }, git, buildTime)).toEqual({
      revision: 'watson-revision',
      commitTime: '2026-10-01T00:00:00.000Z',
      buildTime: '2026-10-01T12:00:00.000Z',
    });
    expect(git).not.toHaveBeenCalled();
  });

  it('uses CI revision metadata when no Watson revision is provided', () => {
    expect(getBuildProvenance({ GITHUB_SHA: 'github-revision' }, () => undefined, buildTime))
      .toEqual({
        revision: 'github-revision',
        commitTime: 'unknown',
        buildTime: '2026-10-01T12:24:00.000Z',
      });
  });

  it('marks unavailable source metadata as unknown and retains the current build time', () => {
    expect(getBuildProvenance({
      WATSON_COMMIT_TIME: 'invalid',
      WATSON_BUILD_TIME: 'invalid',
    }, () => undefined, buildTime)).toEqual({
      revision: 'unknown',
      commitTime: 'unknown',
      buildTime: '2026-10-01T12:24:00.000Z',
    });
  });
});
