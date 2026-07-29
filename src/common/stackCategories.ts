import Thread from '../types/Thread';

export type StackCategory = 'Database' | 'Lucene';

const CATEGORY_PATTERNS: readonly (readonly [StackCategory, RegExp])[] = [
  ['Database', /(?:java\.sql\.|javax\.sql\.|org\.postgresql\.|com\.mysql\.|oracle\.jdbc\.|com\.microsoft\.sqlserver\.)/],
  ['Lucene', /org\.apache\.lucene\./],
];

export const getRepresentativeStackLine = (threads: Thread[]): string => (
  threads.flatMap((thread) => thread.stackTrace).find((line) => line.length > 0) ?? 'Stack trace unavailable'
);

export const getStackCategories = (threads: Thread[]): StackCategory[] => {
  const stackTrace = threads.flatMap((thread) => thread.stackTrace);

  return CATEGORY_PATTERNS
    .filter(([, pattern]) => stackTrace.some((line) => pattern.test(line)))
    .map(([category]) => category);
};
