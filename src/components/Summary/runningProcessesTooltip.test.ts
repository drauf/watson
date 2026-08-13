import Thread from '../../types/Thread';
import ThreadStatus from '../../types/ThreadStatus';
import { getRunningProcessesTooltipData } from './runningProcessesTooltip';

const createThread = (name: string, cpuUsage: string, status = ThreadStatus.RUNNABLE): Thread => {
  const thread = new Thread(1, name);
  thread.cpuUsage = cpuUsage;
  thread.status = status;
  return thread;
};

describe('getRunningProcessesTooltipData', () => {
  it('sorts runnable CPU-active threads and limits the tooltip to ten', () => {
    const threads = Array.from({ length: 12 }, (_, index) => createThread(`worker-${index}`, `${index + 1}.00`)).reverse();
    threads.push(createThread('blocked', '99.00', ThreadStatus.BLOCKED));
    threads.push(createThread('idle', '0.00'));

    expect(getRunningProcessesTooltipData(12, threads)).toEqual({
      runningProcesses: 12,
      threadNames: [
        '12.00% CPU - worker-11',
        '11.00% CPU - worker-10',
        '10.00% CPU - worker-9',
        '9.00% CPU - worker-8',
        '8.00% CPU - worker-7',
        '7.00% CPU - worker-6',
        '6.00% CPU - worker-5',
        '5.00% CPU - worker-4',
        '4.00% CPU - worker-3',
        '3.00% CPU - worker-2',
      ],
    });
  });

  it('uses zero processes and no thread names for incomplete chart payloads', () => {
    expect(getRunningProcessesTooltipData('not-a-number', undefined)).toEqual({
      runningProcesses: 0,
      threadNames: [],
    });
  });
});
