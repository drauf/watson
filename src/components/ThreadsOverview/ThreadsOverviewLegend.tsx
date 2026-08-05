import React, { type JSX } from 'react';
import ThreadStatus from '../../types/ThreadStatus';
import { getThreadStatusAppearance } from '../../common/threadStatusAppearance';

const legendStatuses = [
  { status: ThreadStatus.RUNNABLE, label: 'Runnable' },
  { status: ThreadStatus.BLOCKED, label: 'Blocked' },
  { status: ThreadStatus.WAITING, label: 'Waiting' },
  { status: ThreadStatus.TIMED_WAITING, label: 'Timed waiting' },
];

const statusClassName = (status: ThreadStatus, isMatching = false): string => (
  `threads-overview-status-${getThreadStatusAppearance(status)}${isMatching ? ' threads-overview-status-matching' : ''}`
);

const renderStatusCells = (isMatching = false): JSX.Element[] => legendStatuses.map(({ status }) => (
  <td key={status} className={statusClassName(status, isMatching)}>com.atlassian.watson</td>
));

export default class ThreadsOverviewLegend extends React.PureComponent {
  public override render(): JSX.Element {
    return (
      <table role="presentation" id="thread-overview-legend">
        <thead>
          <tr>
            <th>Legend</th>
            {legendStatuses.map(({ status, label }) => <th key={status}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="name">Normal</td>
            {renderStatusCells()}
          </tr>
          <tr>
            <td className="name">Matching filter</td>
            {renderStatusCells(true)}
          </tr>
        </tbody>
      </table>
    );
  }
}
