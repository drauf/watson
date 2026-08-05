import {
  Outlet, useLoaderData, useLocation, useParams,
} from 'react-router-dom';
import { useEffect } from 'react';
import { WithThreadDumpsProps } from '../common/withThreadDumps';
import { TimeWindowProvider } from '../context/TimeWindowContext';
import './Container.css';
import Navigation from './Navigation/Navigation';

const Container = () => {
  const { pathname } = useLocation();
  const { threadDumps } = useLoaderData<WithThreadDumpsProps>();
  const { threadDumpsHash } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!threadDumpsHash) {
    throw new Error('threadDumpsHash is undefined');
  }

  return (
    <TimeWindowProvider key={threadDumpsHash} threadDumps={threadDumps}>
      <Navigation />
      <Outlet />
    </TimeWindowProvider>
  );
};

export default Container;
