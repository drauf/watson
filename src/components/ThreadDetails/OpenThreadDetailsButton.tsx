import Button from '@atlaskit/button/new';
import React from 'react';
import Thread from '../../types/Thread';
import useOpenThreadDetails from './useOpenThreadDetails';

interface Props {
  text: string;
  className?: string;
  thread: Thread;
  appearance?: 'danger' | 'warning' | 'primary' | 'default' | 'subtle';
  spacing?: 'default' | 'compact';
  shouldFitContainer?: boolean;
}

const OpenThreadDetailsButton: React.FC<Props> = ({
  text, className, thread, appearance, spacing, shouldFitContainer,
}) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);
  const button = (
    <Button
      appearance={appearance ?? 'default'}
      shouldFitContainer={shouldFitContainer ?? false}
      spacing={spacing ?? 'compact'}
      onClick={open}
    >
      {text}
    </Button>
  );

  return (
    <>
      {className ? <span className={className}>{button}</span> : button}
      {WindowComponent}
    </>
  );
};

OpenThreadDetailsButton.defaultProps = {
  className: '',
  appearance: 'default',
  spacing: 'compact',
  shouldFitContainer: false,
};

export default OpenThreadDetailsButton;
