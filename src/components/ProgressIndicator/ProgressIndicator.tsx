import React from 'react';
import { ParseProgress } from '../../parser/AsyncParser';
import './ProgressIndicator.css';

interface Props {
  progress: ParseProgress;
}

const ProgressIndicator: React.FC<Props> = ({ progress }) => {
  const getPhaseText = (phase: ParseProgress['phase']): string => {
    switch (phase) {
      case 'reading':
        return 'Reading files';
      case 'parsing':
        return 'Analyzing thread dumps';
      case 'grouping':
        return 'Finalizing analysis';
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

    if (progress.totalFiles > 1) {
      return `File ${progress.filesProcessed + 1} of ${progress.totalFiles}`;
    }

    return 'Processing file';
  };

  const getCurrentFileName = (): string => {
    if (progress.phase === 'complete' || progress.phase === 'grouping') {
      return '';
    }
    return progress.fileName;
  };

  return (
    <div id="progress-container">
      <div className="progress-indicator">
        <div className="progress-header">
          <h4>{getPhaseText(progress.phase)}</h4>
          <span className="progress-percentage">
            {Math.round(progress.percentage)}
            %
          </span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <div className="progress-details">
          <div className="progress-file">{getDetailText()}</div>
          {getCurrentFileName() && (
            <div className="progress-file-name" title={getCurrentFileName()}>
              {getCurrentFileName()}
            </div>
          )}
          {progress.phase === 'parsing' && progress.totalLines > 0 && (
            <div className="progress-lines">
              {progress.linesProcessed.toLocaleString().padStart(8, '\u00A0')}
              /
              {progress.totalLines.toLocaleString()}
              {' '}
              lines
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
