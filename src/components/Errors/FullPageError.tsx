import React from 'react';
import './FullPageError.css';

interface Props {
  title: string;
  message: string;
  /* eslint-disable-next-line react/require-default-props */
  onRetry?: () => void;
  /* eslint-disable-next-line react/require-default-props */
  retryButtonText?: string;
}

const FullPageError: React.FC<Props> = ({
  title,
  message,
  onRetry,
  retryButtonText = 'Try again',
}) => (
  <div id="error-container">
    <div className="error-indicator">
      <div className="error-header">
        <h4>{title}</h4>
      </div>

      <div className="error-details">
        <div className="error-message" title={message}>
          {message}
        </div>
      </div>

      {onRetry && (
        <div className="error-actions">
          <button
            type="button"
            onClick={onRetry}
            className="retry-button"
          >
            {retryButtonText}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default FullPageError;
