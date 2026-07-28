import Button from '@atlaskit/button';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { clearCurrentData } from '../../common/threadDumpsStorageService';
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher';
import './Navigation.css';

interface LinkProps {
  hash: string;
  pageLink: string;
  displayName: string;
}

const StyledNavLink: React.FC<LinkProps> = (props: LinkProps) => {
  const { hash, pageLink, displayName: name } = props;
  return (
    <li>
      <NavLink to={`/${hash}/${pageLink}`} className={({ isActive }) => (isActive ? ' active' : '')}>
        {name}
      </NavLink>
    </li>
  );
};

const Navigation: React.FC = () => {
  const hash = useParams()['threadDumpsHash'];
  if (hash === undefined) {
    throw new Error('threadDumpsHash is undefined');
  }
  const navigate = useNavigate();

  return (
    <header>
      <div className="header-section">
        <h1>
          Watson
        </h1>

        <nav>
          <ul>
            <StyledNavLink hash={hash} pageLink="summary" displayName="Summary" />
            <StyledNavLink hash={hash} pageLink="cpu-consumers" displayName="CPU consumers" />
            <StyledNavLink hash={hash} pageLink="similar-stacks" displayName="Similar stacks" />
            <StyledNavLink hash={hash} pageLink="stuck-threads" displayName="Stuck threads" />
            <StyledNavLink hash={hash} pageLink="monitors" displayName="Monitors" />
            <StyledNavLink hash={hash} pageLink="flame-graph" displayName="Flame graph" />
            <StyledNavLink hash={hash} pageLink="threads-overview" displayName="Threads overview" />
          </ul>
        </nav>
      </div>

      <div className="header-section">
        <ThemeSwitcher />

        <nav aria-label="Utility navigation">
          <ul>
            <StyledNavLink hash={hash} pageLink="help" displayName="Help & feedback" />
          </ul>
        </nav>

        <Button
          appearance="subtle"
          onClick={() => {
            clearCurrentData();
            navigate('/');
          }}
        >
          Clear data
        </Button>
      </div>
    </header>
  );
};

export default Navigation;
