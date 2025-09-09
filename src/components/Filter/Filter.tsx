import React from 'react';
import './Filter.css';

type Props = {
  name: string;
  displayName: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

export default class Filter extends React.PureComponent<Props> {
  public override render(): JSX.Element {
    const {
      name, displayName, checked, onChange,
    } = this.props;

    return (
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
  }
}
