import * as React from 'react';
import ThreadDump from '../types/ThreadDump';
import { Page } from './Container';
import './Content.css';
import CpuConsumers from './CpuConsumers/CpuConsumers';
import Summary from './Summary/Summary';

interface ContentProps {
  selectedPage: Page;
  threadDumps: ThreadDump[];
}

const Content: React.SFC<ContentProps> = ({ selectedPage, threadDumps }) => {
  let inside;

  switch (selectedPage) {
    case Page.Summary:
      inside = <Summary threadDumps={threadDumps} />
      break
    case Page.CpuConsumers:
      inside = <CpuConsumers threadDumps={threadDumps} />
      break
    case Page.ThreadStatuses:
      inside = <p>ThreadStatuses</p>
      break
    case Page.StuckThreads:
      inside = <p>StuckThreads</p>
      break
    case Page.SimilarStackTraces:
      inside = <p>SimilarStackTraces</p>
      break
    case Page.ThreadsOverview:
      inside = <p>ThreadsOverview</p>
      break
    case Page.Monitors:
      inside = <p>Monitors</p>
      break
    case Page.FlameGraph:
      inside = <p>FlameGraph</p>
      break
    case Page.AdvancedMode:
      inside = <p>AdvancedMode</p>
      break
    default:
      inside = <p>Oops! Something went wrong!</p>
      break
  }

  return (
    <div className="content">
      {inside}
    </div>
  )
}

export default Content;
