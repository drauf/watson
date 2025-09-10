import React from 'react';
import './ErrorIndicator.css';

interface Props {
  title: string;
  message: string;
  onRetry?: () => void;
  retryButtonText?: string;
}

const defaultProps = {
  onRetry: undefined,
  retryButtonText: 'Try again',
};

const ErrorIndicator: React.FC<Props> = ({
  title,
  message,
  onRetry = defaultProps.onRetry,
  retryButtonText = defaultProps.retryButtonText,
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

ErrorIndicator.defaultProps = defaultProps;

export default ErrorIndicator;
