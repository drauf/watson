import React, { ComponentState } from 'react';

export default class PageWithSettings<P, S> extends React.PureComponent<P, S> {
  protected static N0_THREADS_MATCHING = 'No threads match the selected criteria.';

  protected static N0_MONITORS_MATCHING = 'No monitors match the selected criteria.';

  // for some reason eslint thinks properties below are unused
  // eslint-disable-next-line react/no-unused-class-component-methods
  protected handleFilterChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const isChecked: boolean = event.target.checked;
    const newState: ComponentState = { [name]: isChecked };
    this.setState(newState as S);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  protected handleIntegerChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const value: number = parseInt(event.target.value ? event.target.value : '0', 10);
    const newState: ComponentState = { [name]: value > 0 ? value : 0 };
    this.setState(newState as S);
  };

  // eslint-disable-next-line react/no-unused-class-component-methods
  protected handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { name } = event.target;
    const { value } = event.target;
    const newState: ComponentState = { [name]: value };
    this.setState(newState as S);
  };
}
