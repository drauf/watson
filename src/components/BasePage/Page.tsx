import React from 'react';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';

export default class Page<S = never> extends React.PureComponent<WithThreadDumpsProps, S> {
  protected static NO_CPU_INFOS = 'You need to load the <i>cpu_info</i> files to see this data.';

  protected static NO_CPU_AND_THREADS_PAIR = 'You need to load matching <i>cpu_info</i> and <i>jira_threads</i> files to see this data.';

  protected static NO_THREAD_DUMPS = 'You need to load the <i>thread_dump</i> files to see this data.';

  protected static N0_THREADS_MATCHING = 'No threads match the selected criteria.';

  protected static N0_MONITORS_MATCHING = 'No monitors match the selected criteria.';

  protected PAGE_NAME = 'Unknown Page';

  public render(): JSX.Element | null {
    return null;
  }
}
