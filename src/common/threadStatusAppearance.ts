import ThreadStatus from '../types/ThreadStatus';

export type ThreadStatusAppearance = 'success' | 'danger' | 'discovery' | 'warning' | 'neutral';

export const getThreadStatusAppearance = (status: ThreadStatus): ThreadStatusAppearance => {
  switch (status) {
    case ThreadStatus.RUNNABLE:
      return 'success';
    case ThreadStatus.BLOCKED:
      return 'danger';
    case ThreadStatus.WAITING:
      return 'discovery';
    case ThreadStatus.TIMED_WAITING:
      return 'warning';
    default:
      return 'neutral';
  }
};
