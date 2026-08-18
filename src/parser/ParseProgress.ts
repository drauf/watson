export interface ParseProgress {
  phase: 'reading' | 'parsing' | 'grouping' | 'complete';
  fileName: string;
  filesProcessed: number;
  totalFiles: number | undefined;
  linesProcessed: number;
  totalLines: number;
  percentage: number;
}
