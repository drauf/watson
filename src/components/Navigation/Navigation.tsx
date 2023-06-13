import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { clearCurrentData } from '../../common/threadDumpsStorageService';
import './Navigation.css';

type LinkProps = {
  hash: string | undefined;
  pageLink: string;
  displayName: string;
};

function Link(props: LinkProps) {
  const { hash, pageLink, displayName: name } = props;
  return (
    <NavLink to={`/${hash}/${pageLink}`} className={({ isActive }) => isActive ? " active" : ""}>
      <li>{name}</li>
    </NavLink>
  )
}

const onClear = () => {
  const navigate = useNavigate();
  clearCurrentData();
  navigate('/');
};

const Navigation = () => {
  const hash = useParams().threadDumpsHash;

  return (
    <header>
      <div className="header-section">
        <h1>
          Watson
        </h1>

        <nav>
          <ul>
            <Link hash={hash} pageLink='summary' displayName='Summary' />
            <Link hash={hash} pageLink='cpu-consumers-os' displayName='CPU consumers (OS)' />
            <Link hash={hash} pageLink='cpu-consumers-jfr' displayName='CPU consumers (JFR)' />
            <Link hash={hash} pageLink='similar-stacks' displayName='Similar stacks' />
            <Link hash={hash} pageLink='stuck-threads' displayName='Stuck threads' />
            <Link hash={hash} pageLink='monitors' displayName='Monitors' />
            <Link hash={hash} pageLink='flame-graph' displayName='Flame graph' />
            <Link hash={hash} pageLink='threads-overview' displayName='Threads overview' />
          </ul>
        </nav>
      </div>

      <div className="header-section">
        <ul>
          <button type="button" onClick={onClear}><li>Clear current data</li></button>
        </ul>
      </div>
    </header>
  );
}

export default Navigation;
