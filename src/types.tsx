export class ThreadDump {
    date!: Date | null;
    loadAverages!: LoadAverages | null;
    memoryUsage!: MemoryUsage;
    threads: Array<Thread> = [];
    locks: Array<Lock> = [];
}


export class CpuUsage {
    date!: Date | null;
    loadAverages!: LoadAverages | null;
    memoryUsage!: MemoryUsage;
    threadCpuUsages!: Array<ThreadCpuUsage>;
}

export class ThreadCpuUsage {
    id!: number;
    cpuUsage!: number;
    runningFor!: string;
}


export class Thread {
    id!: number;
    name!: string;
    status!: ThreadStatus;
    cpuUsage: number = 0.0;
    runningFor!: string;
    lockWaitingFor!: Lock;
    locksHeld: Array<Lock> = [];
    classicalLocksHeld: Array<Lock> =[];
    meaningfulLinesnumber!: number;
    stackTrace: Array<string> = [];
}

export class Lock {
    id!: string;
    className!: string;
    owner: Thread | null = null;
    waiting: Array<Thread> = [];
}

export class LoadAverages {
    oneMinute!: number;
    fiveMinutes!: number;
    fifteenMinutes!: number;
}

export class MemoryUsage {
    memoryTotal!: number;
    memoryUsed!: number;
    memoryFree!: number;
    swapTotal!: number;
    swapUsed!: number;
    swapFree!: number;
}

export enum ThreadStatus {
    NEW,
    RUNNABLE,
    BLOCKED,
    WAITING,
    TIMED_WAITING,
    UNKNOWN
}
