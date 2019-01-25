import React from 'react';
import { Page } from '../Container';
import './Navigation.css';

type NavigationProps = {
  open: boolean;
  selectPage: (page: Page) => void;
  clearThreadDumps: () => void;
};

export default class Navigation extends React.PureComponent<NavigationProps> {

  public onClick = (page: string): React.MouseEventHandler<HTMLLIElement> => () => {
    window.scrollTo(0, 0);
    this.props.selectPage(page as Page);
  }

  public render() {
    return (
      <div className={this.props.open ? 'nav nav-open' : 'nav'}>
        <div className="nav-content">
          <p className={this.props.open ? 'brand' : 'brand brand-hidden'}>
            Watson
          </p>

          <ul>
            <li onClick={this.onClick(Page.Summary)}>Summary</li>
          </ul>
          <ul>
            <li onClick={this.onClick(Page.CpuConsumers)}>CPU Consumers</li>
            {/* <li onClick={this.onClick(Page.ThreadStatuses)}>Thread Statuses</li> */}
            {/* <li onClick={this.onClick(Page.StuckThreads)}>Stuck Threads</li> */}
            {/* <li onClick={this.onClick(Page.SimilarStackTraces)}>Similar Stack Traces</li> */}
            <li onClick={this.onClick(Page.ThreadsOverview)}>Threads Overview</li>
            <li onClick={this.onClick(Page.Monitors)}>Monitors</li>
            {/* <li onClick={this.onClick(Page.FlameGraph)}>Flame Graph</li> */}
            {/* <li onClick={this.onClick(Page.AdvancedMode)}>Advanced Mode</li> */}
          </ul>

          <ul>
            <li onClick={this.props.clearThreadDumps}>Load another thread dump</li>
          </ul>
        </div>
      </div >
    );
  }
}
