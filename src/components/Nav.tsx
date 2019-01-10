import * as React from 'react';
import './Nav.css';

interface NavProps {
  open: boolean;
}

const Nav: React.SFC<NavProps> = ({ open }) => (
  <div className={open ? "nav nav-open" : "nav"}>
    <p className={open ? "brand" : "brand brand-hidden"}>
      Watson
    </p>
    <ul>
      <li>Summary</li>
    </ul>
    <ul>
      <li>CPU Consumers</li>
      <li>Thread Statuses</li>
      <li>Stuck Threads</li>
      <li>Similar Stack Traces</li>
    </ul>
    <ul>
      <li>Threads Overview</li>
      <li>Monitors</li>
    </ul>
    <ul>
      <li>Flame Graph</li>
      <li>Advanced Mode</li>
    </ul>
  </div >
)

export default Nav;
