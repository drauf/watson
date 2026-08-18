export interface ProgressInput {
  totalBytes: number;
  processedBytes: number;
  currentFileSize: number;
  currentFileFraction: number;
  filesProcessed: number;
  totalFiles: number | undefined;
}

export function calculateParsingPercentage({
  totalBytes,
  processedBytes,
  currentFileSize,
  currentFileFraction,
  filesProcessed,
  totalFiles,
}: ProgressInput): number {
  let processedFraction = (processedBytes + (currentFileSize * currentFileFraction)) / totalBytes;
  if (totalBytes === 0) {
    processedFraction = 0;
    if (totalFiles !== undefined && totalFiles > 0) {
      processedFraction = filesProcessed / totalFiles;
    }
  }
  return Math.min(95, Math.max(0, processedFraction * 95));
}
