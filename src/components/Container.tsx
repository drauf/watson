import { Outlet, useLoaderData, useParams } from 'react-router-dom';
import { WithThreadDumpsProps } from '../common/withThreadDumps';
import { TimeWindowProvider } from '../context/TimeWindowContext';
import './Container.css';
import Navigation from './Navigation/Navigation';

const Container = () => {
  const { threadDumps } = useLoaderData() as WithThreadDumpsProps;
  const { threadDumpsHash } = useParams();

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
