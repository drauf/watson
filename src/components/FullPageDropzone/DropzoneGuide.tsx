import React from 'react';
import { ISSUE_TRACKER_LINK, SOURCE_CODE_LINK } from '../Navigation/Navigation';
import OutboundLink from '../Navigation/OutboundLink';

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
    <h5 dangerouslySetInnerHTML={{ __html: header }} />
    <span>
      See: <OutboundLink to={GATHER_DATA_LINK}>
        How to gather data
        </OutboundLink>
    </span>

    <p dangerouslySetInnerHTML={{ __html: disclaimer }} />

    <ul id="dropzone-links">
      <li>
        <OutboundLink to={ISSUE_TRACKER_LINK}>
          Issue tracker
        </OutboundLink>
      </li>
      <li>
        <OutboundLink to={SOURCE_CODE_LINK}>
          Source code
        </OutboundLink>
      </li>
    </ul>
  </div>
);

export default DropzoneGuide;
