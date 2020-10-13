import React from 'react';
import './Filter.css';

type Props = {
  name: string;
  displayName: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Filter: React.SFC<Props> = ({
  name, displayName, checked, onChange,
}) => (
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

export default Filter;
