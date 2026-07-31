import React, { type JSX } from 'react';

export default class ThreadsOverviewLegend extends React.PureComponent {
  public override render(): JSX.Element {
    return (
      <table role="presentation" id="thread-overview-legend">
        <thead>
          <tr>
            <th>Legend</th>
            <th>Runnable</th>
            <th>Blocked</th>
            <th>Waiting</th>
            <th>Timed waiting</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="name">Normal</td>
            <td className="runnable">com.atlassian.watson</td>
            <td className="blocked">com.atlassian.watson</td>
            <td className="waiting">com.atlassian.watson</td>
            <td className="timed-waiting">com.atlassian.watson</td>
          </tr>
          <tr>
            <td className="name">Matching filter</td>
            <td className="runnable-matching">com.atlassian.watson</td>
            <td className="blocked-matching">com.atlassian.watson</td>
            <td className="waiting-matching">com.atlassian.watson</td>
            <td className="timed-waiting-matching">com.atlassian.watson</td>
          </tr>
        </tbody>
      </table>
    );
  }
}
