import React from 'react';

export default class ThreadsOverviewLegend extends React.PureComponent {
  public override render(): JSX.Element {
    return (
      <table id="thread-overview-legend">
        <tbody>
          <tr>
            <td className="runnable">Runnable</td>
            <td className="blocked">Blocked</td>
            <td className="waiting">Waiting</td>
            <td className="timed-waiting">Timed waiting</td>
            <td />
            <td className="matching">Matching filter</td>
          </tr>
        </tbody>
      </table>
    );
  }
}
