import * as React from 'react';
import './NavToggle.css';

interface NavToggleProps {
  open: boolean;
  onClick: () => void;
}

const NavToggle: React.SFC<NavToggleProps> = ({ open, onClick }) => (
  <div className={open ? "nav-toggle open" : "nav-toggle"} onClick={onClick} />
)

export default NavToggle;
