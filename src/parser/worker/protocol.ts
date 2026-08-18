import type { ParseProgress } from '../ParseProgress';
import ThreadDump from '../../types/ThreadDump';
import type { PerformanceConfig } from '../PerformanceConfig';

export interface StartParseRequest {
  type: 'start';
  totalFiles: number | undefined;
  totalBytes: number;
  config: PerformanceConfig;
}

export interface ParseFileRequest {
  type: 'parse-file';
  file: File;
}

export interface FinishParseRequest {
  type: 'finish';
}

export interface ReadyForFileMessage {
  type: 'ready-for-file';
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

export type WorkerRequest = StartParseRequest | ParseFileRequest | FinishParseRequest | TransferResultRequest;
export type WorkerResponse = ReadyForFileMessage | ProgressMessage | ReadyToTransferMessage | CompleteMessage | ErrorMessage;
