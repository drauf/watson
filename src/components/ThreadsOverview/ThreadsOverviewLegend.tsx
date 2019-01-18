import React from 'react';
import './ThreadsOverview.css';

const ThreadsOverviewLegend: React.SFC = () => (
  <table className="thread-overview-legend">
    <tbody>
      <tr>
        <td className="runnable" />
        <td className="blocked" />
        <td className="waiting" />
        <td className="timed-waiting" />
        <td className="unknown" />
        <td />
        <td className="matching" />
      </tr>
      <tr>
        <td>runnable</td>
        <td>blocked</td>
        <td>waiting</td>
        <td>timed waiting</td>
        <td>new or unknown</td>
        <td />
        <td>matching filter</td>
      </tr>
    </tbody>
  </table>
);

export default ThreadsOverviewLegend;
