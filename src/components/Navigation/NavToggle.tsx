import React from 'react';
import './NavToggle.css';

type Props = {
  open: boolean;
  onClick: () => void;
};

const NavToggle: React.FunctionComponent<Props> = ({ open, onClick }) => (
  <button type="button" className={open ? 'nav-toggle open' : 'nav-toggle'} onClick={onClick}>
    <div id="nav-arrow" />
  </button>
);

export default NavToggle;
