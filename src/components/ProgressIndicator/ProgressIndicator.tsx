import Heading from '@atlaskit/heading';
import ProgressBar from '@atlaskit/progress-bar';
import React from 'react';
import { ParseProgress } from '../../parser/AsyncParser';
import '../Container.css';
import './ProgressIndicator.css';

export interface StorageProgress {
  phase: 'storing';
  fileName: string;
  filesProcessed: number;
  totalFiles: number;
  linesProcessed: number;
  totalLines: number;
  percentage: number;
}

export type UploadProgress = ParseProgress | StorageProgress;

interface Props {
  progress: UploadProgress;
}

const ProgressIndicator: React.FC<Props> = ({ progress }) => {
  const getPhaseText = (phase: UploadProgress['phase']): string => {
    switch (phase) {
      case 'reading':
        return 'Reading files';
      case 'parsing':
        return 'Analyzing thread dumps';
      case 'grouping':
        return 'Finalizing analysis';
      case 'storing':
        return 'Saving analysis';
      case 'complete':
        return 'Analysis complete';
      default:
        return 'Processing';
    }
  };

  const getDetailText = (): string => {
    if (progress.phase === 'complete') {
      return `Successfully processed ${progress.totalFiles} file${progress.totalFiles === 1 ? '' : 's'}`;
    }

    if (progress.phase === 'grouping') {
      return 'Grouping CPU usage data with thread dumps';
    }

    if (progress.phase === 'storing') {
      return 'Saving parsed analysis to local storage';
    }

    if (progress.totalFiles > 1) {
      return `File ${progress.filesProcessed + 1} of ${progress.totalFiles}`;
    }

    return 'Processing file';
  };

  const getCurrentFileName = (): string => {
    if (progress.phase === 'complete' || progress.phase === 'grouping' || progress.phase === 'storing') {
      return '';
    }
    return progress.fileName;
  };

  const isFinalizing = progress.phase === 'grouping' || progress.phase === 'storing';

  return (
    <div id="progress-container">
      <div className="progress-indicator">
        <div className="progress-header">
          <Heading as="h4" size="small">{getPhaseText(progress.phase)}</Heading>
          {!isFinalizing && (
            <span className="progress-percentage">
              {Math.round(progress.percentage)}
              %
            </span>
          )}
        </div>

        <ProgressBar
          ariaLabel={isFinalizing ? 'Finalizing analysis' : `${Math.round(progress.percentage)}% complete`}
          isIndeterminate={isFinalizing}
          testId="parser-progress"
          value={progress.percentage / 100}
        />

        <div className="progress-details">
          <div className="progress-file">{getDetailText()}</div>
          {getCurrentFileName() && (
            <div className="progress-file-name" title={getCurrentFileName()}>
              {getCurrentFileName()}
            </div>
          )}
          {progress.phase === 'parsing' && progress.totalLines > 0 && (
            <code className="progress-lines">
              {progress.linesProcessed.toLocaleString().padStart(8, '\u00A0')}
              /
              {progress.totalLines.toLocaleString()}
              {' '}
              lines
            </code>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProgressIndicator;
