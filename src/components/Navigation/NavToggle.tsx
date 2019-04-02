import React from 'react';
import './NavToggle.css';

type Props = {
  open: boolean;
  onClick: () => void;
};

const NavToggle: React.SFC<Props> = ({ open, onClick }) => (
  <div className={open ? 'nav-toggle open' : 'nav-toggle'} onClick={onClick}>
    <div id="nav-arrow" />
  </div>
);

export default NavToggle;
