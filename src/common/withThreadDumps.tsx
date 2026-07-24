import { ComponentType } from 'react';
import { LoaderFunction } from 'react-router-dom';
import { useTimeWindowData } from '../context/TimeWindowContext';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';

export interface WithThreadDumpsProps {
  threadDumps: ThreadDump[];
}

export const threadDumpsLoader: LoaderFunction = async function threadDumpsLoader({ params }): Promise<WithThreadDumpsProps> {
  const { threadDumpsHash } = params;
  if (threadDumpsHash === undefined) {
    throw new Error('threadDumpsHash is undefined');
  }

  const threadDumps = await getThreadDumpsAsync(threadDumpsHash);
  return { threadDumps };
};

// Returns thread dumps in the applied shared time window
export const useThreadDumps = (): ThreadDump[] => useTimeWindowData().threadDumps;

// Use only for pages that intentionally ignore the shared time window
export const useAllThreadDumps = (): ThreadDump[] => useTimeWindowData().allThreadDumps;

export const withThreadDumps = (WrappedComponent: ComponentType<WithThreadDumpsProps>): ComponentType => {
  const WithThreadDumps = () => <WrappedComponent threadDumps={useThreadDumps()} />;
  return WithThreadDumps;
};

export const withAllThreadDumps = (WrappedComponent: ComponentType<WithThreadDumpsProps>): ComponentType => {
  const WithAllThreadDumps = () => <WrappedComponent threadDumps={useAllThreadDumps()} />;
  return WithAllThreadDumps;
};
