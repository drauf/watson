import Button from '@atlaskit/button';
import React from 'react';
import Thread from '../../types/Thread';
import useOpenThreadDetails from './useOpenThreadDetails';

interface Props {
  text: string;
  className?: string;
  thread: Thread;
  appearance?: 'danger' | 'warning' | 'default' | 'subtle';
  spacing?: 'default' | 'compact' | 'none';
}

const OpenThreadDetailsButton: React.FC<Props> = ({
  text, className, thread, appearance, spacing,
}) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);

  return (
    <>
      <Button
        appearance={appearance ?? 'default'}
        spacing={spacing ?? 'compact'}
        onClick={open}
        {...(className ? { className } : {})}
      >
        {text}
      </Button>
      {WindowComponent}
    </>
  );
};

OpenThreadDetailsButton.defaultProps = {
  className: '',
  appearance: 'default',
  spacing: 'compact',
};

export default OpenThreadDetailsButton;
