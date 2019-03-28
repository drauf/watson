import React from 'react';
import ReactGA, { OutboundLink } from 'react-ga';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearThreadDumps } from '../../App';
import './Navigation.css';

// tslint:disable:max-line-length
export const ISSUE_TRACKER_LINK: string = 'https://ecosystem.atlassian.net/secure/RapidBoard.jspa?projectKey=WAT&rapidView=501&view=planning';
export const SOURCE_CODE_LINK: string = 'https://bitbucket.org/atlassian/watsonjs/';
// tslint:enable:max-line-length

type Props = RouteComponentProps & {
  open: boolean;
};

class Navigation extends React.PureComponent<Props> {

  public render() {
    return (
      <nav className={this.props.open ? 'open' : ''}>
        <p id={this.props.open ? 'brand-visible' : 'brand-hidden'}>
          Watson
          </p>

        <ul>
          <NavLink to="/summary/"><li>Summary</li></NavLink>
        </ul>
        <ul>
          <NavLink to="/cpu-consumers/"><li>CPU Consumers</li></NavLink>
          <NavLink to="/similar-stacks/"><li>Similar Stack Traces</li></NavLink>
          <NavLink to="/threads-overview/"><li>Threads Overview</li></NavLink>
          <NavLink to="/monitors/"><li>Monitors</li></NavLink>
        </ul>

        <div id="nav-content-bottom">
          <ul>
            <li onClick={this.onClear}>Load another thread dump</li>
          </ul>

          <ul>
            <OutboundLink
              eventLabel="Issue tracker"
              to={ISSUE_TRACKER_LINK}
              target="_blank"
            >
              <li>Issue tracker</li>
            </OutboundLink>
            <OutboundLink
              eventLabel="Issue tracker"
              to={SOURCE_CODE_LINK}
              target="_blank"
            >
              <li>Source code</li>
            </OutboundLink>
          </ul>
        </div>
      </nav>
    );
  }

  private onClear = () => {
    ReactGA.event({
      action: 'Cleared thread dumps',
      category: 'Navigation',
    });

    clearThreadDumps();
    this.props.history.push('/');
  }
}

export default withRouter(Navigation);
