import React from 'react';
import ReactGA, { OutboundLink } from 'react-ga';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearCurrentThreadDump } from '../../common/threadDumpsStorageService';
import './Navigation.css';

// tslint:disable:max-line-length
export const KUDOS_LINK: string = 'http://go.atlassian.com/kudos';
export const ISSUE_TRACKER_LINK: string = 'https://ecosystem.atlassian.net/secure/RapidBoard.jspa?projectKey=WAT&rapidView=501&view=planning';
export const SOURCE_CODE_LINK: string = 'https://bitbucket.org/atlassian/watsonjs/';
// tslint:enable:max-line-length

type Props = RouteComponentProps<any> & {
  open: boolean;
};

class Navigation extends React.PureComponent<Props> {

  public render() {
    const key: string = this.props.match.params.key as string;

    return (
      <nav className={this.props.open ? 'open' : ''}>
        <p id={this.props.open ? 'brand-visible' : 'brand-hidden'}>
          Watson
        </p>

        <ul>
          <NavLink to={`/${key}/summary/`}><li>Summary</li></NavLink>
        </ul>
        <ul>
          <NavLink to={`/${key}/cpu-consumers/`}><li>CPU Consumers</li></NavLink>
          <NavLink to={`/${key}/similar-stacks/`}><li>Similar Stack Traces</li></NavLink>
          <NavLink to={`/${key}/threads-overview/`}><li>Threads Overview</li></NavLink>
          <NavLink to={`/${key}/monitors/`}><li>Monitors</li></NavLink>
        </ul>

        <div id="nav-content-bottom">
          <ul>
            <li onClick={this.onClear}>Load another thread dump</li>
          </ul>

          <ul>
            <OutboundLink eventLabel="go/kudos" to={KUDOS_LINK} target="_blank">
              <li id="kudos">go/kudos</li>
            </OutboundLink>
            <OutboundLink eventLabel="Issue tracker" to={ISSUE_TRACKER_LINK} target="_blank">
              <li>Issue tracker</li>
            </OutboundLink>
            <OutboundLink eventLabel="Issue tracker" to={SOURCE_CODE_LINK} target="_blank">
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
