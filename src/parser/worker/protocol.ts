import type { ParseProgress } from '../ParseProgress';
import ThreadDump from '../../types/ThreadDump';
import type { PerformanceConfig } from '../PerformanceConfig';

export interface ParseRequest {
  type: 'parse';
  files: File[];
  config: PerformanceConfig;
}

export interface ProgressMessage {
  type: 'progress';
  progress: ParseProgress;
}

export interface CompleteMessage {
  type: 'complete';
  threadDumps: ThreadDump[];
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  stack?: string;
}

export type WorkerRequest = ParseRequest;
export type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage;
