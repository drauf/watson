import React from 'react';
import { Outlet } from 'react-router-dom';
import './Container.css';
import Navigation from './Navigation/Navigation';

export default class Container extends React.PureComponent {
  public render(): JSX.Element {
    return (
      <>
        <Navigation />
        <Outlet />
      </>
    );
  }
}
