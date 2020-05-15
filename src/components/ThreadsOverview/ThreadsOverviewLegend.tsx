import React from 'react';

const ThreadsOverviewLegend: React.SFC = () => (
  <table id="thread-overview-legend">
    <tbody>
      <tr>
        <td className="runnable">runnable</td>
        <td className="blocked">blocked</td>
        <td className="waiting">waiting</td>
        <td className="timed-waiting">timed waiting</td>
        <td />
        <td className="matching">matching filter</td>
      </tr>
    </tbody>
  </table>
);

export default ThreadsOverviewLegend;
