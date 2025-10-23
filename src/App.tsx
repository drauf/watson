import { RouterProvider, createHashRouter } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
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
import ThreadsOverviewPage from './components/ThreadsOverview/ThreadsOverviewPage';
import Index from './components/Index/Index';
import TestProgressPage from './components/ProgressIndicator/TestProgressPage';

const routes = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: ':threadDumpsHash/*',
    element: <Container />,
    errorElement: <FullPageDropzone />, // todo: proper error page
    children: [
      {
        path: 'summary',
        element: <SummaryPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'cpu-consumers',
        element: <CpuConsumersPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'similar-stacks',
        element: <SimilarStacksPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'stuck-threads',
        element: <StuckThreadsPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'monitors',
        element: <MonitorsPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'flame-graph',
        element: <FlameGraphPage />,
        loader: threadDumpsLoader,
      },
      {
        path: 'threads-overview',
        element: <ThreadsOverviewPage />,
        loader: threadDumpsLoader,
      },
      {
        path: '*',
        element: <PageNotFoundError />,
      },
    ],
  },
];

if (import.meta.env.DEV) {
  routes.push({
    path: '/test/progress',
    element: <TestProgressPage />,
  });
}

const router = createHashRouter(routes);

const App = () => (
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
);

export default App;
