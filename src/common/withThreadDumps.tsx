import React from 'react';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';
import { useLoaderData } from 'react-router-dom';

export type WithThreadDumpsProps = {
  threadDumps: ThreadDump[];
};

export async function threadDumpsLoader({ params }: any): Promise<WithThreadDumpsProps> {
  const threadDumps = await getThreadDumpsAsync(params.threadDumpsHash);
  return { threadDumps };
}

export function useThreadDumps(): ThreadDump[] {
  const { threadDumps } = useLoaderData() as WithThreadDumpsProps;
  return threadDumps;
}

export const withThreadDumps = (WrappedComponent: React.ComponentType<WithThreadDumpsProps>): React.ComponentType => {
  const WithThreadDumps: React.FC = () => {
    const threadDumps = useThreadDumps();
    return <WrappedComponent threadDumps={threadDumps} />;
  }
  return WithThreadDumps;
};
