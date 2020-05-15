import React from 'react';

const ThreadsOverviewLegend: React.SFC = () => (
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

export default ThreadsOverviewLegend;
