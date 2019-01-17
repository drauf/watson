import React from 'react';
import './ThreadsOverview.css';

const ThreadsOverviewLegend: React.SFC = () => (
  <div className="thread-overview-legend">
    <table>
      <tbody>
        <tr>
          <td className="new" />
          <td className="runnable" />
          <td className="blocked" />
          <td className="waiting" />
          <td className="timed-waiting" />
          <td className="unknown" />
        </tr>
        <tr>
          <td>new</td>
          <td>runnable</td>
          <td>blocked</td>
          <td>waiting</td>
          <td>timed waiting</td>
          <td>unknown</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ThreadsOverviewLegend;
