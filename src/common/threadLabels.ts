import Thread from '../types/Thread';

export const CPU_ACTIVE_THRESHOLD = 10;

export const ThreadLabel = {
  BACKGROUND: 'background',
  CPU_ACTIVE: 'cpuActive',
  DATABASE: 'database',
  HTTP: 'http',
  INDEX_SEARCH: 'indexSearch',
  USER_DIRECTORY: 'userDirectory',
} as const;

export type ThreadLabel = typeof ThreadLabel[keyof typeof ThreadLabel];

const HTTP_THREAD_PATTERN = /^https?-.*exec/;
const JVM_HOUSEKEEPING_THREAD_PATTERN = /^Attach Listener|^C[12] CompilerThread|^G1 Conc#\d+$|^G1 Concurrent |^G1 Main|^G1 Refine#\d+$|^Gang worker#|^GC Daemon|^GC Thread#\d+$|^Service Thread|^Signal Dispatcher|^String Deduplication Thread|^Surrogate Locker Thread|^VM Periodic|^VM Thread/;
const INDEX_SEARCH_PATTERN = /org\.(?:apache\.lucene|opensearch)\./;
const USER_DIRECTORY_PATTERN = /com\.atlassian\.(?:crowd\.(?!filter\.)|jira\.crowd\.)/;
const DATABASE_PATTERN = /database|sql|query|jdbc|jooq|postgres|mysql|oracle|c3p0/i;

const labelDisplayNames: Record<ThreadLabel, string> = {
  [ThreadLabel.BACKGROUND]: 'Background',
  [ThreadLabel.CPU_ACTIVE]: 'CPU active',
  [ThreadLabel.DATABASE]: 'Database',
  [ThreadLabel.HTTP]: 'HTTP',
  [ThreadLabel.INDEX_SEARCH]: 'Index search',
  [ThreadLabel.USER_DIRECTORY]: 'User directory',
};

export const hasThreadLabel = (thread: Thread, label: ThreadLabel): boolean => (
  thread.labels?.includes(label) ?? false
);

export const isJvmHousekeepingThread = (thread: Thread): boolean => JVM_HOUSEKEEPING_THREAD_PATTERN.test(thread.name);

export const getStaticThreadLabels = (thread: Thread): ThreadLabel[] => {
  const labels: ThreadLabel[] = HTTP_THREAD_PATTERN.test(thread.name)
    ? [ThreadLabel.HTTP]
    : [ThreadLabel.BACKGROUND];

  if (thread.stackTrace.some((line) => INDEX_SEARCH_PATTERN.test(line))) {
    labels.push(ThreadLabel.INDEX_SEARCH);
  }
  if (thread.stackTrace.some((line) => DATABASE_PATTERN.test(line))) {
    labels.push(ThreadLabel.DATABASE);
  }
  if (thread.stackTrace.some((line) => USER_DIRECTORY_PATTERN.test(line))) {
    labels.push(ThreadLabel.USER_DIRECTORY);
  }

  return labels;
};

export const setStaticThreadLabels = (thread: Thread): void => {
  // eslint-disable-next-line no-param-reassign
  thread.labels = getStaticThreadLabels(thread);
};

export const updateCpuActiveLabel = (thread: Thread): void => {
  const labelsWithoutCpuActivity = (thread.labels ?? []).filter((label) => label !== ThreadLabel.CPU_ACTIVE);

  // eslint-disable-next-line no-param-reassign
  thread.labels = parseFloat(thread.cpuUsage) >= CPU_ACTIVE_THRESHOLD
    ? [...labelsWithoutCpuActivity, ThreadLabel.CPU_ACTIVE]
    : labelsWithoutCpuActivity;
};

export const getThreadGroupLabels = (threads: Thread[]): ThreadLabel[] => {
  if (threads.length === 0) {
    return [];
  }

  const labels: ThreadLabel[] = [];
  if (threads.every((thread) => hasThreadLabel(thread, ThreadLabel.HTTP))) {
    labels.push(ThreadLabel.HTTP);
  } else if (threads.every((thread) => hasThreadLabel(thread, ThreadLabel.BACKGROUND))) {
    labels.push(ThreadLabel.BACKGROUND);
  }

  [
    ThreadLabel.INDEX_SEARCH,
    ThreadLabel.DATABASE,
    ThreadLabel.USER_DIRECTORY,
    ThreadLabel.CPU_ACTIVE,
  ].forEach((label) => {
    if (threads.some((thread) => hasThreadLabel(thread, label))) {
      labels.push(label);
    }
  });

  return labels;
};

export const getThreadLabelDisplayName = (label: ThreadLabel): string => labelDisplayNames[label];

export const getThreadLabelAppearance = (label: ThreadLabel): 'accent-blue' | 'accent-yellow' | 'discovery' => {
  if (label === ThreadLabel.HTTP || label === ThreadLabel.BACKGROUND) {
    return 'discovery';
  }
  if (label === ThreadLabel.CPU_ACTIVE) {
    return 'accent-blue';
  }
  return 'accent-yellow';
};
