import React, { ReactNode, type JSX } from 'react';

interface Props {
  to: string;
  children: ReactNode;
}

export default class OutboundLink extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const { to, children } = this.props;

    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
}
