enum ThreadStatus {
  RUNNABLE = 'runnable',
  BLOCKED = 'blocked',
  WAITING = 'waiting',
  TIMED_WAITING = 'timed-waiting',
  NEW = 'new',
  TERMINATED = 'terminated',
  UNKNOWN = 'unknown',
}

export default ThreadStatus;
