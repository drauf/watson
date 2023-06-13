import React from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import ThreadDump from '../types/ThreadDump';
import { getThreadDumpsAsync } from './threadDumpsStorageService';

export type WithThreadDumpsProps = {
  threadDumps: ThreadDump[];
};

export const threadDumpsLoader: LoaderFunction = async function threadDumpsLoader({ params }): Promise<WithThreadDumpsProps> {
  const { threadDumpsHash } = params;
  if (threadDumpsHash === undefined) {
    throw new Error('threadDumpsHash is undefined');
  }

  const threadDumps = await getThreadDumpsAsync(threadDumpsHash);
  return { threadDumps };
};

export function useThreadDumps(): ThreadDump[] {
  const { threadDumps } = useLoaderData() as WithThreadDumpsProps;
  return threadDumps;
}

export const withThreadDumps = (WrappedComponent: React.ComponentType<WithThreadDumpsProps>): React.ComponentType => {
  const WithThreadDumps: React.FC = function WithThreadDumps() {
    const threadDumps = useThreadDumps();
    return <WrappedComponent threadDumps={threadDumps} />;
  };
  return WithThreadDumps;
};
