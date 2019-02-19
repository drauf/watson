import React from 'react';
import Navigation from '../Navigation/Navigation';

// tslint:disable:max-line-length
const header = 'You should upload both the <i>jira_cpu_usage</i> and <i>jira_threads</i> files.';
const line1 = 'Files are matched together based on the timestamps in their names, allowing for small differences.';
const line2 = 'For example, <i>jira_cpu_usage.1540384812.txt</i> might be matched with <i>jira_threads.1540384814.txt</i>.';
const line3 = 'If the names of the files you upload have a different format, weird things <i>might</i> and <i>will</i> happen.';
// tslint:enable:max-line-length

// don't open dropzone popup when clicking on the navigation links
const stopPropagation = (event: React.MouseEvent) => {
  event.stopPropagation();
};

const DropzoneGuide: React.SFC = () => (
  <>
    <h6 dangerouslySetInnerHTML={{ __html: header }} />
    <span dangerouslySetInnerHTML={{ __html: line1 }} />
    <span dangerouslySetInnerHTML={{ __html: line2 }} />
    <span dangerouslySetInnerHTML={{ __html: line3 }} />

    <ul id="dropzone-links" onClick={stopPropagation}>
      <li><a href={Navigation.ISSUE_TRACKER_LINK}>Issue tracker</a></li>
      <li><a href={Navigation.SOURCE_CODE_LINK}>Source code</a></li>
    </ul>
  </>
);

export default DropzoneGuide;
