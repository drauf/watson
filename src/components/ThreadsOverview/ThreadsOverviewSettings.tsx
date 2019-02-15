import React from 'react';

type ThreadsOverviewSettingsProps = {
  nameFilter: string;
  stackFilter: string;
  onSettingsChange: React.ChangeEventHandler<HTMLInputElement>;
};

const ThreadsOverviewSettings: React.SFC<ThreadsOverviewSettingsProps> =
  ({ nameFilter, stackFilter, onSettingsChange }) => (
    <div id="threads-overview-settings">
      <label>
        <input type="text" name="nameFilter" value={nameFilter} onChange={onSettingsChange}
        />
        <b>Thread name RegExp</b>
      </label>

      <label>
        <input type="text" name="stackFilter" value={stackFilter} onChange={onSettingsChange}
        />
        <b>Stack trace RegExp</b>
      </label>
    </div >
  );

export default ThreadsOverviewSettings;
