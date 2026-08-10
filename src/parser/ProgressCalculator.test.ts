import { calculateParsingPercentage } from './ProgressCalculator';

describe('calculateParsingPercentage', () => {
  it('weights progress by file bytes', () => {
    expect(calculateParsingPercentage({
      totalBytes: 1000,
      processedBytes: 200,
      currentFileSize: 800,
      currentFileFraction: 0.5,
      filesProcessed: 1,
      totalFiles: 2,
    })).toBe(57);
  });

  it('falls back to file counts when files have no bytes', () => {
    expect(calculateParsingPercentage({
      totalBytes: 0,
      processedBytes: 0,
      currentFileSize: 0,
      currentFileFraction: 0,
      filesProcessed: 1,
      totalFiles: 2,
    })).toBe(47.5);
  });

  it('handles an empty import', () => {
    expect(calculateParsingPercentage({
      totalBytes: 0,
      processedBytes: 0,
      currentFileSize: 0,
      currentFileFraction: 0,
      filesProcessed: 0,
      totalFiles: 0,
    })).toBe(0);
  });
});
