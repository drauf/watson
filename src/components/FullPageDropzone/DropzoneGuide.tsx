import React from 'react';
import { OutboundLink } from 'react-ga';
import { ISSUE_TRACKER_LINK, SOURCE_CODE_LINK } from '../Navigation/Navigation';

// tslint:disable:max-line-length
const header = 'For the full experience, you should gather thread dumps along with <i>top</i> outputs.';
const GATHER_DATA_LINK = 'https://github.com/drauf/watson/blob/master/README.md#gathering-thread-dumps';
const disclaimer = 'Watson works fully offline. No files will leave your machine.';
// tslint:enable:max-line-length

const stopPropagation = (event: React.MouseEvent) => {
  // prevent opening the dropzone popup when clicking on the navigation links
  event.stopPropagation();
};

const DropzoneGuide: React.SFC = () => (
  <div id="dropzone-guide" onClick={stopPropagation}>
    <h6 dangerouslySetInnerHTML={{ __html: header }} />
    <span>
      See: <OutboundLink eventLabel="Gathering data" to={GATHER_DATA_LINK} target="_blank">
        How to gather data
        </OutboundLink>
    </span>

    <p dangerouslySetInnerHTML={{ __html: disclaimer }} />

    <ul id="dropzone-links">
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
  </div>
);

export default DropzoneGuide;
