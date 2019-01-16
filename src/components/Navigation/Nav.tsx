import React from 'react';
import { Page } from '../Container';
import './Nav.css';

type NavProps = {
  open: boolean;
  selectPage: (page: Page) => void;
}

export default class Nav extends React.Component<NavProps, any> {
  public onClick: React.MouseEventHandler<HTMLLIElement> = (event) => {
    const element: HTMLLIElement = event.target as HTMLLIElement
    this.props.selectPage(element.value as Page)
  }

  public render() {
    return (
      <div className={this.props.open ? "nav nav-open" : "nav"}>
        <div className="nav-content">
          <p className={this.props.open ? "brand" : "brand brand-hidden"}>
            Watson
          </p>
          <ul>
            <li onClick={this.onClick} value="0">Summary</li>
          </ul>
          <ul>
            <li onClick={this.onClick} value="1">CPU Consumers</li>
            <li onClick={this.onClick} value="2">Thread Statuses</li>
            <li onClick={this.onClick} value="3">Stuck Threads</li>
            <li onClick={this.onClick} value="4">Similar Stack Traces</li>
          </ul>
          <ul>
            <li onClick={this.onClick} value="5">Threads Overview</li>
            <li onClick={this.onClick} value="6">Monitors</li>
          </ul>
          <ul>
            <li onClick={this.onClick} value="7">Flame Graph</li>
            <li onClick={this.onClick} value="8">Advanced Mode</li>
          </ul>
        </div>
      </div >
    )
  }
}
