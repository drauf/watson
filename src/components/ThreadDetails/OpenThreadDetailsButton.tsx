/* React 19 removed function-component defaultProps; parameter defaults below are the replacement. */
/* eslint-disable react/require-default-props */
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
  text,
  className = '',
  thread,
  appearance = 'default',
  spacing = 'compact',
  shouldFitContainer = false,
}) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);
  const button = (
    <Button
      appearance={appearance}
      shouldFitContainer={shouldFitContainer}
      spacing={spacing}
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
export default OpenThreadDetailsButton;
