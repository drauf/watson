import React from 'react';
import './Filter.css';
import SmartTooltip from '../common/SmartTooltip';

type Props = {
  name: string;
  displayName: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  tooltip?: string;
};

export default class Filter extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      name, displayName, checked, onChange, tooltip,
    } = this.props;

    const labelElement = (
      <label className={checked ? 'checked' : ''}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />
        {displayName}
      </label>
    );

    return tooltip ? (
      <SmartTooltip tooltip={tooltip}>
        {labelElement}
      </SmartTooltip>
    ) : labelElement;
  }
}
