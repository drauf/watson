import React, { ComponentState } from 'react';
import Page from './Page';

export default class PageWithSettings<S> extends Page<S> {
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
