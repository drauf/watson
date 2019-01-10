import * as React from 'react';
import './Nav.css';

interface NavProps {
  open: boolean;
}

const Nav: React.SFC<NavProps> = ({ open }) => {
  const classNames = open ? "nav nav-open" : "nav";

  return (
    <div className={classNames} />
  )
}

export default Nav;
