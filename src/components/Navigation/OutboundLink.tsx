import React, { ReactNode } from 'react';

type Props = {
  to: string;
  children: ReactNode;
};

const OutboundLink: React.FunctionComponent<Props> = ({ to, children }) => (
  <a href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default OutboundLink;
