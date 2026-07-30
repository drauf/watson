import Button from '@atlaskit/button/new';
import Heading from '@atlaskit/heading';
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
        <Heading size="large" id="error-title" as="h2">{title}</Heading>
        <p className="error-message">{message}</p>
        <div className="error-actions">
          <Button
            appearance="primary"
            onClick={() => {
              clearCurrentData();
              navigate(0);
            }}
          >
            Try again
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FullPageError;
