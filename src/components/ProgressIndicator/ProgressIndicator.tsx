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
        return 'Reading files...';
      case 'parsing':
        return 'Parsing thread dumps...';
      case 'grouping':
        return 'Grouping CPU data...';
      case 'complete':
        return 'Complete!';
      default:
        return 'Processing...';
    }
  };

  const getDetailText = (): string => {
    if (progress.phase === 'complete') {
      return `Processed ${progress.totalFiles} file(s)`;
    }

    if (progress.phase === 'grouping') {
      return 'Finalizing data...';
    }

    if (progress.totalFiles > 1) {
      return `File ${progress.filesProcessed + 1} of ${progress.totalFiles}: ${progress.fileName}`;
    }

    return progress.fileName;
  };

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <h3>{getPhaseText(progress.phase)}</h3>
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
        {progress.phase === 'parsing' && progress.totalLines > 0 && (
          <div className="progress-lines">
            {progress.linesProcessed.toLocaleString()}
            {' '}
            /
            {progress.totalLines.toLocaleString()}
            {' '}
            lines
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;
