import React from 'react';
import ThreadDump from '../types/ThreadDump';
import { Page } from './Container';
import './Content.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
import MonitorsPage from './Monitors/MonitorsPage';
import SummaryPage from './Summary/SummaryPage';
import ThreadsOverviewPage from './ThreadsOverview/ThreadsOverviewPage';

type ContentProps = {
  selectedPage: Page;
  threadDumps: ThreadDump[];
};

const Content: React.SFC<ContentProps> = ({ selectedPage, threadDumps }) => {
  switch (selectedPage) {
    case Page.Summary:
      return <SummaryPage threadDumps={threadDumps} />;
    case Page.CpuConsumers:
      return <CpuConsumersPage threadDumps={threadDumps} />;
    case Page.ThreadsOverview:
      return <ThreadsOverviewPage threadDumps={threadDumps} />;
    case Page.Monitors:
      return <MonitorsPage threadDumps={threadDumps} />;
    default:
      return <h2>Oops! Something went wrong!</h2>;
  }
};

export default Content;
