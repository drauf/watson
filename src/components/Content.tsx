import * as React from 'react';
import { Page } from './Container';

interface ContentProps {
  selectedPage: Page;
}

const Content: React.SFC<ContentProps> = ({ selectedPage }) => {
  switch (selectedPage) {
    case Page.Summary:
      return <p>Summary</p>
    case Page.CpuConsumers:
      return <p>CpuConsumers</p>
    case Page.ThreadStatuses:
      return <p>ThreadStatuses</p>
    case Page.StuckThreads:
      return <p>StuckThreads</p>
    case Page.SimilarStackTraces:
      return <p>SimilarStackTraces</p>
    case Page.ThreadsOverview:
      return <p>ThreadsOverview</p>
    case Page.Monitors:
      return <p>Monitors</p>
    case Page.FlameGraph:
      return <p>FlameGraph</p>
    case Page.AdvancedMode:
      return <p>AdvancedMode</p>
    default:
      return <p>Oops! Something went wrong!</p>
  }
}

export default Content;
