import { updateCpuActiveLabel } from '../common/threadLabels';
import ThreadDump from '../types/ThreadDump';
import type Thread from '../types/Thread';
import CpuUsage from './cpuusage/CpuUsage';

const MAX_DIFFERENCE_BETWEEN_CORRESPONDING_FILES_IN_MS = 10000;
const AN_HOUR = 60 * 60 * 1000;

function findClosestThreadDump(
  threadDumps: ThreadDump[],
  getDifference: (dumpEpoch: number) => number,
): ThreadDump | undefined {
  let closest: ThreadDump | undefined;
  let smallestDifference = MAX_DIFFERENCE_BETWEEN_CORRESPONDING_FILES_IN_MS;

  for (const threadDump of threadDumps) {
    if (threadDump.epoch) {
      const difference = getDifference(threadDump.epoch);
      if (difference < smallestDifference) {
        smallestDifference = difference;
        closest = threadDump;
      }
    }
  }

  return closest;
}

export function findCorrespondingThreadDump(threadDumps: ThreadDump[], cpuUsage: CpuUsage): ThreadDump {
  const exactMatch = cpuUsage.timestampKind === 'absolute'
    ? findClosestThreadDump(threadDumps, (dumpEpoch) => Math.abs(dumpEpoch - cpuUsage.epoch))
    : undefined;
  const closest = exactMatch ?? findClosestThreadDump(
    threadDumps,
    (dumpEpoch) => Math.abs((dumpEpoch % AN_HOUR) - (cpuUsage.epoch % AN_HOUR)),
  );

  if (closest !== undefined) return closest;

  const threadDump = new ThreadDump(cpuUsage.epoch);
  threadDumps.push(threadDump);
  return threadDump;
}

export function groupCpuUsageWithThreadDump(threadDump: ThreadDump, cpuUsage: CpuUsage): void {
  if (cpuUsage.loadAverages !== undefined) {
    // eslint-disable-next-line no-param-reassign -- Attaches matching CPU metadata to this dump
    threadDump.loadAverages = cpuUsage.loadAverages;
  }
  // eslint-disable-next-line no-param-reassign -- Attaches matching CPU metadata to this dump
  threadDump.runningProcesses = cpuUsage.runningProcesses;
  if (cpuUsage.memoryUsage !== undefined) {
    // eslint-disable-next-line no-param-reassign -- Attaches matching CPU metadata to this dump
    threadDump.memoryUsage = cpuUsage.memoryUsage;
  }

  const threadsById = new Map<number, Thread>();
  for (const thread of threadDump.threads) {
    if (!threadsById.has(thread.id)) {
      threadsById.set(thread.id, thread);
    }
  }

  for (const cpu of cpuUsage.getThreadCpuUsages()) {
    const thread = threadsById.get(cpu.id);
    if (thread !== undefined) {
      thread.cpuUsage = cpu.getCpuUsage();
      thread.runningFor = cpu.runningFor;
      updateCpuActiveLabel(thread);
    }
  }
}

export function sortThreadDumps(threadDumps: ThreadDump[]): void {
  threadDumps.sort((first, second) => {
    if (first.epoch === second.epoch) return 0;
    if (!first.epoch) return -1;
    if (!second.epoch) return 1;
    return first.epoch - second.epoch;
  });
}
