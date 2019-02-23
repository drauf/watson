import React from 'react';
import { OutboundLink } from 'react-ga';
import { Page } from '../Container';
import './Navigation.css';

type NavigationProps = {
  open: boolean;
  onPageSelect: (page: Page) => void;
  clearThreadDumps: () => void;
};

export default class Navigation extends React.PureComponent<NavigationProps> {
  // tslint:disable:max-line-length
  public static ISSUE_TRACKER_LINK: string = 'https://ecosystem.atlassian.net/secure/RapidBoard.jspa?projectKey=WAT&rapidView=501&view=planning';
  public static SOURCE_CODE_LINK: string = 'https://bitbucket.org/atlassian/watsonjs/';
  // tslint:enable:max-line-length

  public render() {
    return (
      <nav className={this.props.open ? 'open' : ''}>
        <p id={this.props.open ? 'brand-visible' : 'brand-hidden'}>
          Watson
          </p>

        <ul>
          <li onClick={this.onClick(Page.Summary)}>Summary</li>
        </ul>
        <ul>
          <li onClick={this.onClick(Page.CpuConsumers)}>CPU Consumers</li>
          <li onClick={this.onClick(Page.SimilarStacks)}>Similar Stack Traces</li>
          <li onClick={this.onClick(Page.ThreadsOverview)}>Threads Overview</li>
          <li onClick={this.onClick(Page.Monitors)}>Monitors</li>
        </ul>

        <div id="nav-content-bottom">
          <ul>
            <li onClick={this.props.clearThreadDumps}>Load another thread dump</li>
          </ul>

          <ul>
            <OutboundLink
              eventLabel="Issue tracker"
              to={Navigation.ISSUE_TRACKER_LINK}
              target="_blank"
            >
              <li>Issue tracker</li>
            </OutboundLink>
            <OutboundLink
              eventLabel="Issue tracker"
              to={Navigation.SOURCE_CODE_LINK}
              target="_blank"
            >
              <li>Source code</li>
            </OutboundLink>
          </ul>
        </div>
      </nav>
    );
  }

  private onClick = (page: string): React.MouseEventHandler<HTMLLIElement> => () => {
    this.props.onPageSelect(page as Page);
  }
}
