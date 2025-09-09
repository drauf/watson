import React from 'react';
import { Outlet } from 'react-router-dom';
import './Container.css';
import Navigation from './Navigation/Navigation';

interface Props {
  // This component doesn't receive any props
}

export default class Container extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    return (
      <>
        <Navigation />
        <Outlet />
      </>
    );
  }
}
