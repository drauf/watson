import React from 'react';
import './ThreadsOverview.css';

const ThreadsOverviewLegend: React.SFC = () => (
  <div className="thread-overview-legend">
    <table>
      <tbody>
        <tr>
          <td className="runnable" />
          <td className="blocked" />
          <td className="waiting" />
          <td className="timed-waiting" />
          <td className="unknown" />
        </tr>
        <tr>
          <td>runnable</td>
          <td>blocked</td>
          <td>waiting</td>
          <td>timed waiting</td>
          <td>new or unknown</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ThreadsOverviewLegend;
