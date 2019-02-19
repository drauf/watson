import React from 'react';
import './Filter.css';

type FilterProps = {
  name: string;
  displayName: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const Filter: React.SFC<FilterProps> = ({ name, displayName, checked, onChange }) => (
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
