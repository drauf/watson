import React from 'react';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import { clearCurrentThreadDump } from '../../common/threadDumpsStorageService';
import './Navigation.css';

type Props = RouteComponentProps<{ key: string }>;

class Navigation extends React.PureComponent<Props> {
  private onClear = () => {
    const { history } = this.props;
    clearCurrentThreadDump();
    history.push('/');
  };

  public render(): JSX.Element {
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
            <button type="button" onClick={this.onClear}><li>Clear current data</li></button>
          </ul>
        </div>
      </header>
    );
  }
}

export default withRouter(Navigation);
