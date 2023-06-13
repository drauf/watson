import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { clearCurrentData } from '../../common/threadDumpsStorageService';
import './Navigation.css';

type LinkProps = {
  hash: string;
  pageLink: string;
  displayName: string;
};

function StyledNavLink(props: LinkProps) {
  const { hash, pageLink, displayName: name } = props;
  return (
    <NavLink to={`/${hash}/${pageLink}`} className={({ isActive }) => (isActive ? ' active' : '')}>
      <li>{name}</li>
    </NavLink>
  );
}

export default function Navigation() {
  const hash = useParams().threadDumpsHash!;
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
            <StyledNavLink hash={hash} pageLink="cpu-consumers-os" displayName="CPU consumers (OS)" />
            <StyledNavLink hash={hash} pageLink="cpu-consumers-jfr" displayName="CPU consumers (JFR)" />
            <StyledNavLink hash={hash} pageLink="similar-stacks" displayName="Similar stacks" />
            <StyledNavLink hash={hash} pageLink="stuck-threads" displayName="Stuck threads" />
            <StyledNavLink hash={hash} pageLink="monitors" displayName="Monitors" />
            <StyledNavLink hash={hash} pageLink="flame-graph" displayName="Flame graph" />
            <StyledNavLink hash={hash} pageLink="threads-overview" displayName="Threads overview" />
          </ul>
        </nav>
      </div>

      <div className="header-section">
        <ul>
          <button
            type="button"
            onClick={() => {
              clearCurrentData();
              navigate('/');
            }}
          >
            <li>Clear current data</li>
          </button>
        </ul>
      </div>
    </header>
  );
}
