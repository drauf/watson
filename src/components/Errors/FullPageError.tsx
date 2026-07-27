import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearCurrentData } from '../../common/threadDumpsStorageService';
import '../Container.css';
import './FullPageError.css';

interface Props {
  title: string;
  message: string;
}

const FullPageError: React.FC<Props> = ({ title, message }) => {
  const navigate = useNavigate();

  return (
    <div id="error-container">
      <section className="error-indicator" aria-labelledby="error-title">
        <h2 id="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <button
            type="button"
            className="primary"
            onClick={() => {
              clearCurrentData();
              navigate(0);
            }}
          >
            Try again
          </button>
        </div>
      </section>
    </div>
  );
};

export default FullPageError;
