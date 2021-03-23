import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearCurrentThreadDump } from '../../common/threadDumpsStorageService';
import OutboundLink from './OutboundLink';
import './Navigation.css';

export const ISSUE_TRACKER_LINK = 'https://github.com/drauf/watson/issues';
export const SOURCE_CODE_LINK = 'https://github.com/drauf/watson';

type Props = RouteComponentProps<{ key: string }>;

class Navigation extends React.PureComponent<Props> {
  private onClear = () => {
    const { history } = this.props;
    clearCurrentThreadDump();
    history.push('/');
  };

  public render() {
    const { match } = this.props;
    const { key } = match.params;

    return (
      <header>
        <div className="header-section">
          <h1>
            Watson
          </h1>

          <nav>
            <ul>
              <NavLink to={`/${key}/summary/`} activeClassName="active"><li>Summary</li></NavLink>
              <NavLink to={`/${key}/cpu-consumers/`} activeClassName="active"><li>CPU consumers</li></NavLink>
              <NavLink to={`/${key}/similar-stacks/`} activeClassName="active"><li>Similar stacks</li></NavLink>
              <NavLink to={`/${key}/stuck-threads/`} activeClassName="active"><li>Stuck threads</li></NavLink>
              <NavLink to={`/${key}/monitors/`} activeClassName="active"><li>Monitors</li></NavLink>
              <NavLink to={`/${key}/flame-graph/`} activeClassName="active"><li>Flame graph</li></NavLink>
              <NavLink to={`/${key}/threads-overview/`} activeClassName="active"><li>Threads overview</li></NavLink>
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
