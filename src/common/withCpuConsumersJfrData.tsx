import React from 'react';
import { getCpuUsageJfrAsync } from './threadDumpsStorageService';
import CpuUsageJfr from '../parser/cpuusage/jfr/CpuUsageJfr';
import { useLoaderData } from 'react-router-dom';

export type WithThreadCpuUsageProps = {
  cpuUsageJfrList: CpuUsageJfr[];
};

export async function cpuUsageJfrListLoader({ params }: any): Promise<WithThreadCpuUsageProps> {
  const cpuUsageJfrList = await getCpuUsageJfrAsync(params.threadDumpsHash);
  return { cpuUsageJfrList };
}

function useCpuUsageJfrList(): CpuUsageJfr[] {
  const { cpuUsageJfrList } = useLoaderData() as WithThreadCpuUsageProps;
  return cpuUsageJfrList;
}

export const withCpuConsumersJfrData = (WrappedComponent: React.ComponentType<WithThreadCpuUsageProps>): React.ComponentType => {
  const WithCpuConsumersJfrData: React.FC = () => {
    const cpuUsageJfrList = useCpuUsageJfrList();
    return <WrappedComponent cpuUsageJfrList={cpuUsageJfrList} />;
  }
  return WithCpuConsumersJfrData;
};
