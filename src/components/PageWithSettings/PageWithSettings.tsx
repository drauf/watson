import React, { ComponentState } from 'react';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';

export default class PageWithSettings<S> extends React.PureComponent<WithThreadDumpsProps, S> {
  protected static NO_CPU_INFOS = 'You need to load the <i>cpu_info</i> files to see this data.';

  protected static NO_CPU_AND_THREADS_PAIR = 'You need to load matching <i>cpu_info</i> and <i>jira_threads</i> files to see this data.';

  protected static NO_THREAD_DUMPS = 'You need to load the <i>thread_dump</i> files to see this data.';

  protected static N0_THREADS_MATCHING = 'No threads match the selected criteria.';

  protected static N0_MONITORS_MATCHING = 'No monitors match the selected criteria.';

  protected PAGE_NAME = 'Unknown Page';

  public render(): JSX.Element | null {
    return null;
  }

  protected handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };
    this.setState(newState);
  }

  protected handleIntegerChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const value: number = parseInt(event.target.value ? event.target.value : '0', 10);
    const newState: ComponentState = { [name]: value > 0 ? value : 0 };
    this.setState(newState);
  }

  protected handleRegExpChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const { value } = event.target;
    const newState: ComponentState = { [name]: value };
    this.setState(newState);
  }
}
