import React, { ComponentState } from 'react';
import Page from './BasePage/Page';

export default class PageWithSettings<S> extends Page<S> {
  protected static N0_THREADS_MATCHING = 'No threads match the selected criteria.';

  protected static N0_MONITORS_MATCHING = 'No monitors match the selected criteria.';

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
