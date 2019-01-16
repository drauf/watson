import React from 'react';
import ThreadDump from '../types/ThreadDump';
import { Page } from './Container';
import './Content.css';
import CpuConsumers from './CpuConsumers/CpuConsumers';
import Summary from './Summary/Summary';
import ThreadsOverview from './ThreadsOverview/ThreadsOverview';

type ContentProps = {
  selectedPage: Page;
  threadDumps: ThreadDump[];
};

const Content: React.SFC<ContentProps> = ({ selectedPage, threadDumps }) => {
  switch (selectedPage) {
    case Page.Summary:
      return <Summary threadDumps={threadDumps} />;
    case Page.CpuConsumers:
      return <CpuConsumers threadDumps={threadDumps} />;
    case Page.ThreadStatuses:
      return <p>ThreadStatuses</p>;
    case Page.StuckThreads:
      return <p>StuckThreads</p>;
    case Page.SimilarStackTraces:
      return <p>SimilarStackTraces</p>;
    case Page.ThreadsOverview:
      return <ThreadsOverview threadDumps={threadDumps} />;
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
