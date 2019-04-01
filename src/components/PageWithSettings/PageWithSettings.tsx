import React, { ComponentState } from 'react';
import ReactGA from 'react-ga';
import { WithThreadDumpsProps } from '../../common/withThreadDumps';

export default class PageWithSettings<S> extends React.PureComponent<WithThreadDumpsProps, S> {
  // tslint:disable:max-line-length
  protected static NO_CPU_INFOS = 'You need to load the <i>cpu_info</i> files to see this data.';
  protected static NO_CPU_AND_THREADS_PAIR = 'You need to load matching <i>cpu_info</i> and <i>jira_threads</i> files to see this data.';
  protected static NO_THREAD_DUMPS = 'You need to load the <i>thread_dump</i> files to see this data.';
  protected static N0_THREADS_MATCHING = 'No stack traces match the selected criteria.';
  // tslint:enable:max-line-length

  protected PAGE_NAME = 'Unknown Page';

  public render(): JSX.Element | null {
    return null;
  }

  protected handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };

    ReactGA.event({
      action: `${this.PAGE_NAME} settings changed`,
      category: 'Navigation',
      label: `Filter ${name} changed to ${isChecked}`,
    });
    this.setState(newState);
  }

  protected handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    let value: number = parseInt(event.target.value ? event.target.value : '0', 10);
    if (value < 0) {
      value = 0;
    }
    const newState: ComponentState = { [name]: value > 0 ? value : 0 };

    ReactGA.event({
      action: `${this.PAGE_NAME} settings changed`,
      category: 'Navigation',
      label: `Number ${name} changed to ${value}`,
    });
    this.setState(newState);
  }

  protected handleRegExpChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const name: string = event.target.name;
    const value: string = event.target.value;
    const newState: ComponentState = { [name]: value };

    ReactGA.event({
      action: `${this.PAGE_NAME} settings changed`,
      category: 'Navigation',
      label: `RegExp ${name} changed to ${value}`,
    });
    this.setState(newState);
  }
}
