import * as React from 'react';
import './NavToggle.css';

interface NavToggleProps {
  onClick: () => void;
}

const NavToggle: React.SFC<NavToggleProps> = ({ onClick }) => (
  <div className="nav-toggle" onClick={onClick} />
)

export default NavToggle;
