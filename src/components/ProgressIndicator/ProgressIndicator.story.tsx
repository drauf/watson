import React from 'react';
import { ParseProgress } from '../../parser/AsyncParser';
import ProgressIndicator from './ProgressIndicator';

const createProgress = (overrides: Partial<ParseProgress> = {}): ParseProgress => ({
  phase: 'reading',
  fileName: 'thread_dump_001.txt',
  filesProcessed: 0,
  totalFiles: 10,
  linesProcessed: 0,
  totalLines: 50_000,
  percentage: 5,
  ...overrides,
});

interface StoryProps {
  progress: ParseProgress;
}

const ProgressIndicatorStory: React.FC<StoryProps> = ({ progress }) => (
  <ProgressIndicator progress={progress} />
);

export const Reading = () => <ProgressIndicatorStory progress={createProgress()} />;

export const Parsing = () => (
  <ProgressIndicatorStory
    progress={createProgress({
      phase: 'parsing',
      fileName: 'thread_dump_005.txt',
      filesProcessed: 4,
      linesProcessed: 15_000,
      percentage: 45,
    })}
  />
);

export const Grouping = () => (
  <ProgressIndicatorStory
    progress={createProgress({
      phase: 'grouping',
      fileName: '',
      filesProcessed: 10,
      linesProcessed: 50_000,
      percentage: 95,
    })}
  />
);

export const Complete = () => (
  <ProgressIndicatorStory
    progress={createProgress({
      phase: 'complete',
      fileName: '',
      filesProcessed: 10,
      linesProcessed: 50_000,
      percentage: 100,
    })}
  />
);
