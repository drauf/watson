import React from 'react';
import ReactGA, { OutboundLink } from 'react-ga';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearCurrentThreadDump } from '../../common/threadDumpsStorageService';
import './Navigation.css';

// tslint:disable:max-line-length
export const ISSUE_TRACKER_LINK: string = 'https://github.com/drauf/watson/issues';
export const SOURCE_CODE_LINK: string = 'https://github.com/drauf/watson';
// tslint:enable:max-line-length

type Props = RouteComponentProps<any> & {
  open: boolean;
};

class Navigation extends React.PureComponent<Props> {

  public render() {
    const key: string = this.props.match.params.key as string;

    return (
      <nav className={this.props.open ? 'open' : ''}>
        <h1 id={this.props.open ? 'brand-visible' : 'brand-hidden'}>
          Watson
        </h1>

        <ul>
          <NavLink to={`/${key}/summary/`}><li>Summary</li></NavLink>
        </ul>
        <ul>
          <NavLink to={`/${key}/cpu-consumers/`}><li>CPU Consumers</li></NavLink>
          <NavLink to={`/${key}/similar-stacks/`}><li>Similar Stack Traces</li></NavLink>
          <NavLink to={`/${key}/stuck-threads/`}><li>Stuck Threads Suspects</li></NavLink>
          <NavLink to={`/${key}/threads-overview/`}><li>Threads Overview</li></NavLink>
          <NavLink to={`/${key}/monitors/`}><li>Monitors</li></NavLink>
        </ul>

        <div id="nav-content-bottom">
          <ul>
            <li onClick={this.onClear}>Load another thread dump</li>
          </ul>

          <ul>
            <OutboundLink eventLabel="Issue tracker" to={ISSUE_TRACKER_LINK} target="_blank">
              <li>Issue tracker</li>
            </OutboundLink>
            <OutboundLink eventLabel="Source code" to={SOURCE_CODE_LINK} target="_blank">
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

    clearCurrentThreadDump();
    this.props.history.push('/');
  }
}

export default withRouter(Navigation);
