import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearCurrentThreadDump } from '../../common/threadDumpsStorageService';
import './Navigation.css';
import OutboundLink from './OutboundLink';

export const ISSUE_TRACKER_LINK = 'https://github.com/drauf/watson/issues';
export const SOURCE_CODE_LINK = 'https://github.com/drauf/watson';

type Props = RouteComponentProps<{ key: string }>;

class Navigation extends React.PureComponent<Props> {
  private onClear = () => {
    const { history } = this.props;
    clearCurrentThreadDump();
    history.push('/');
  }

  public render() {
    const { match } = this.props;
    const key: string = match.params.key as string;

    return (
      <header>
        <div className="header-section">
          <h1>
            Watson
          </h1>

          <nav>
            <ul>
              <NavLink to={`/${key}/summary/`}><li>Summary</li></NavLink>
            </ul>
            <ul>
              <NavLink to={`/${key}/cpu-consumers/`}><li>CPU consumers</li></NavLink>
              <NavLink to={`/${key}/similar-stacks/`}><li>Similar stack traces</li></NavLink>
              <NavLink to={`/${key}/stuck-threads/`}><li>Stuck threads suspects</li></NavLink>
              <NavLink to={`/${key}/threads-overview/`}><li>Threads overview</li></NavLink>
              <NavLink to={`/${key}/monitors/`}><li>Monitors</li></NavLink>
            </ul>
          </nav>
        </div>

        <div className="header-section">
          <ul>
            <button type="button" onClick={this.onClear}><li>Load another thread dump</li></button>
          </ul>

          <ul>
            <OutboundLink to={ISSUE_TRACKER_LINK}>
              <li>Issue tracker</li>
            </OutboundLink>
            <OutboundLink to={SOURCE_CODE_LINK}>
              <li>Source code</li>
            </OutboundLink>
          </ul>
        </div>
      </header>
    );
  }
}

export default withRouter(Navigation);
