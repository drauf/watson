import * as React from 'react';
import Content from './Content';
import './Layout.css';
import Nav from './Nav';
import NavToggle from './NavToggle';

interface LayoutState {
  navigationOpen: boolean;
}

class Layout extends React.Component<any, LayoutState> {
  public state: LayoutState = {
    navigationOpen: true
  };

  public toggleNavigation = () => {
    this.setState((prevState) => ({ navigationOpen: !prevState.navigationOpen }))
  }

  public render() {
    return (
      <div className="container">
        <Nav open={this.state.navigationOpen} />
        <NavToggle onClick={this.toggleNavigation} />
        <Content />
      </div>
    )
  }
}

export default Layout;
