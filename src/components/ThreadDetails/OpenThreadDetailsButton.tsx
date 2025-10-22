import React from 'react';
import './ThreadDetailsWindow.css';
import Thread from '../../types/Thread';
import useOpenThreadDetails from './useOpenThreadDetails';

type Props = {
  text: string;
  className: string;
  thread: Thread;
};

const OpenThreadDetailsButton: React.FC<Props> = ({ text, className, thread }) => {
  const { open, WindowComponent } = useOpenThreadDetails(thread);

  return (
    <>
      <button type="button" className={className} onClick={open}>
        {text}
      </button>
      {WindowComponent}
    </>
  );
};

export default OpenThreadDetailsButton;
