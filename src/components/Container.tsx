import React from 'react';
import ReactGA from 'react-ga';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getThreadDumps } from '../App';
import './Container.css';
import Content from './Content';
import Navigation from './Navigation/Navigation';
import NavToggle from './Navigation/NavToggle';

type ContainerState = {
  navigationOpen: boolean;
};

class Container extends React.PureComponent<RouteComponentProps, ContainerState> {

  public state: ContainerState = {
    navigationOpen: true,
  };

  public componentDidMount() {
    this.scrollToTop();
  }

  public render() {
    if (getThreadDumps().length === 0) {
      this.props.history.push('/');
      return null;
    }

    return (
      <div id="container">
        <Navigation open={this.state.navigationOpen} />

        <NavToggle open={this.state.navigationOpen} onClick={this.toggleNavigation} />

        <div id="content">
          <Content />
        </div>
      </div >
    );
  }

  private toggleNavigation = () => {
    this.setState((prevState) => {
      const isOpen = !prevState.navigationOpen;

      ReactGA.event({
        action: isOpen ? 'Navigation toggled open' : 'Navigation toggled close',
        category: 'Navigation',
      });

      return { navigationOpen: isOpen };
    });
  }

  private scrollToTop = () => {
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.scrollTop = 0;
    }
  }
}

export default withRouter(Container);
