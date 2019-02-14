import React from 'react';
import { Page } from '../Container';
import './Navigation.css';

type NavigationProps = {
  open: boolean;
  onPageSelect: (page: Page) => void;
  clearThreadDumps: () => void;
};

export default class Navigation extends React.PureComponent<NavigationProps> {
  // tslint:disable:max-line-length
  public static sourceCodeLink: string = 'https://bitbucket.org/atlassian/watsonjs/';
  public static issueTrackerLink: string = 'https://ecosystem.atlassian.net/secure/RapidBoard.jspa?projectKey=WAT&rapidView=501&view=planning';
  public static documentationLink: string = 'https://hello.atlassian.net/wiki/spaces/~drauf/pages/390789227/Watson+your+astute+assistant';
  // tslint:enable:max-line-length

  public onClick = (page: string): React.MouseEventHandler<HTMLLIElement> => () => {
    this.props.onPageSelect(page as Page);
  }

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
          <li onClick={this.onClick(Page.ThreadsOverview)}>Threads Overview</li>
          <li onClick={this.onClick(Page.Monitors)}>Monitors</li>
        </ul>

        <div id="nav-content-bottom">
          <ul>
            <li onClick={this.props.clearThreadDumps}>Load another thread dump</li>
          </ul>

          <ul>
            <a href={Navigation.sourceCodeLink}><li>Source code</li></a>
            <a href={Navigation.issueTrackerLink}><li>Issue tracker</li></a>
            <a href={Navigation.documentationLink}><li>Documentation</li></a>
          </ul>
        </div>
      </nav>
    );
  }
}
