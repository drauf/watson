import React from 'react';
import { OutboundLink } from 'react-ga';
import { ISSUE_TRACKER_LINK, SOURCE_CODE_LINK } from '../Navigation/Navigation';

// tslint:disable:max-line-length
const header = 'You should load all <i>jira_cpu_usage</i>, <i>jira_threads</i>, and <i>pmap_output</i> files.';
const subheader = 'Alternatively, for limited functionality, load a single file (like <i>catalina.out</i>) containg all thread dumps.';
const disclaimer = 'Watson works fully offline. No files will leave your machine.';
// tslint:enable:max-line-length

const stopPropagation = (event: React.MouseEvent) => {
  // prevent opening the dropzone popup when clicking on the navigation links
  event.stopPropagation();
};

const DropzoneGuide: React.SFC = () => (
  <>
    <h6 dangerouslySetInnerHTML={{ __html: header }} />
    <span dangerouslySetInnerHTML={{ __html: subheader }} />

    <p dangerouslySetInnerHTML={{ __html: disclaimer }} />

    <ul id="dropzone-links" onClick={stopPropagation}>
      <li>
        <OutboundLink eventLabel="Issue tracker" to={ISSUE_TRACKER_LINK} target="_blank">
          Issue tracker
        </OutboundLink>
      </li>
      <li>
        <OutboundLink eventLabel="Source code" to={SOURCE_CODE_LINK} target="_blank">
          Source code
        </OutboundLink>
      </li>
    </ul>
  </>
);

export default DropzoneGuide;
