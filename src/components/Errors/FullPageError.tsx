import React from 'react';
import './FullPageError.css';
import { useNavigate } from 'react-router-dom';
import { clearCurrentData } from '../../common/threadDumpsStorageService';

interface Props {
  title: string;
  message: string;
}

const FullPageError: React.FC<Props> = ({
  title,
  message,
}) => {
  const navigate = useNavigate();

  return (
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

        <div className="error-actions">
          <button
            type="button"
            onClick={() => {
              clearCurrentData();
              navigate(0);
            }}
            className="retry-button"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullPageError;
