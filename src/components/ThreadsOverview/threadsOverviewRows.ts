import Thread from '../../types/Thread';

export interface ThreadOverviewDataRow {
  readonly id: number;
  readonly name: string;
  readonly threadsByDump: ReadonlyMap<number, Thread>;
}

export const createThreadOverviewRows = (
  threadGroups: Map<number, Thread>[],
): ThreadOverviewDataRow[] => threadGroups
  .map((threadsByDump) => {
    const firstThread = threadsByDump.values().next().value;
    if (!firstThread) {
      throw new Error('Thread overview rows must contain at least one thread');
    }

    return {
      id: firstThread.id,
      name: firstThread.name,
      threadsByDump,
    };
  });
