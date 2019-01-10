import * as React from 'react';
import './Container.css';
import Content from './Content';
import Nav from './Nav';
import NavToggle from './NavToggle';

interface ContainerState {
  navigationOpen: boolean;
}

class Container extends React.Component<any, ContainerState> {
  public state: ContainerState = {
    navigationOpen: true
  };

  public toggleNavigation = () => {
    this.setState((prevState) => ({ navigationOpen: !prevState.navigationOpen }))
  }

  public render() {
    return (
      <div className="container">
        <Nav open={this.state.navigationOpen} />
        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />
        <Content />
      </div>
    )
  }
}

export default Container;
