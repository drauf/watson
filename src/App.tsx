import AppProvider from '@atlaskit/app-provider';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import './App.css';
import FullPageDropzone from './components/FullPageDropzone/FullPageDropzone';
import Container from './components/Container';
import PageNotFoundError from './components/Errors/PageNotFoundError';
import SummaryPage from './components/Summary/SummaryPage';
import { threadDumpsLoader } from './common/withThreadDumps';
import CpuConsumersPage from './components/CpuConsumers/CpuConsumersPage';
import SimilarStacksPage from './components/SimilarStacks/SimilarStacksPage';
import StuckThreadsPage from './components/StuckThreads/StuckThreadsPage';
import MonitorsPage from './components/Monitors/MonitorsPage';
import FlameGraphPage from './components/FlameGraph/FlameGraphPage';
// eslint-disable-next-line import-x/no-named-as-default -- Named export lets component tests avoid the shared time-window wrapper
import ThreadsOverviewPage from './components/ThreadsOverview/ThreadsOverviewPage';
import Index from './components/Index/Index';
import HelpPage from './components/Help/HelpPage';

const routes = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: ':threadDumpsHash/*',
    element: <Container />,
    loader: threadDumpsLoader,
    errorElement: <FullPageDropzone />, // todo: proper error page
    children: [
      {
        path: 'summary',
        element: <SummaryPage />,
      },
      {
        path: 'cpu-consumers',
        element: <CpuConsumersPage />,
      },
      {
        path: 'similar-stacks',
        element: <SimilarStacksPage />,
      },
      {
        path: 'stuck-threads',
        element: <StuckThreadsPage />,
      },
      {
        path: 'monitors',
        element: <MonitorsPage />,
      },
      {
        path: 'flame-graph',
        element: <FlameGraphPage />,
      },
      {
        path: 'threads-overview',
        element: <ThreadsOverviewPage />,
      },
      {
        path: 'help',
        element: <HelpPage />,
      },
      {
        path: '*',
        element: <PageNotFoundError />,
      },
    ],
  },
];
const router = createHashRouter(routes);

const App = () => (
  <AppProvider defaultColorMode="auto">
    <RouterProvider router={router} />
  </AppProvider>
);

export default App;
