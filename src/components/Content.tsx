import React from 'react';
import ThreadDump from '../types/ThreadDump';
import { Page } from './Container';
import './Content.css';
import CpuConsumersPage from './CpuConsumers/CpuConsumersPage';
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
    case Page.ThreadStatuses:
      return <p>ThreadStatuses</p>;
    case Page.StuckThreads:
      return <p>StuckThreads</p>;
    case Page.SimilarStackTraces:
      return <p>SimilarStackTraces</p>;
    case Page.ThreadsOverview:
      return <ThreadsOverviewPage threadDumps={threadDumps} />;
    case Page.Monitors:
      return <p>Monitors</p>;
    case Page.FlameGraph:
      return <p>FlameGraph</p>;
    case Page.AdvancedMode:
      return <p>AdvancedMode</p>;
    default:
      return <p>Oops! Something went wrong!</p>;
  }
};

export default Content;
