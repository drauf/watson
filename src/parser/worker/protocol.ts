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

export interface TransferResultRequest {
  type: 'transfer-result';
}

export interface ReadyToTransferMessage {
  type: 'ready-to-transfer';
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

export type WorkerRequest = ParseRequest | TransferResultRequest;
export type WorkerResponse = ProgressMessage | ReadyToTransferMessage | CompleteMessage | ErrorMessage;
