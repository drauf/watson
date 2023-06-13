import React from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { getCpuUsageJfrAsync } from './threadDumpsStorageService';
import CpuUsageJfr from '../parser/cpuusage/jfr/CpuUsageJfr';

export type WithThreadCpuUsageProps = {
  cpuUsageJfrList: CpuUsageJfr[];
};

export const cpuUsageJfrListLoader: LoaderFunction = async function cpuUsageJfrListLoader({ params }): Promise<WithThreadCpuUsageProps> {
  const { threadDumpsHash } = params;
  if (threadDumpsHash === undefined) {
    throw new Error('threadDumpsHash is undefined');
  }

  const cpuUsageJfrList = await getCpuUsageJfrAsync(threadDumpsHash);
  return { cpuUsageJfrList };
};

function useCpuUsageJfrList(): CpuUsageJfr[] {
  const { cpuUsageJfrList } = useLoaderData() as WithThreadCpuUsageProps;
  return cpuUsageJfrList;
}

export const withCpuConsumersJfrData = (WrappedComponent: React.ComponentType<WithThreadCpuUsageProps>): React.ComponentType => {
  const WithCpuConsumersJfrData: React.FC = function WithCpuConsumersJfrData() {
    const cpuUsageJfrList = useCpuUsageJfrList();
    return <WrappedComponent cpuUsageJfrList={cpuUsageJfrList} />;
  };
  return WithCpuConsumersJfrData;
};
