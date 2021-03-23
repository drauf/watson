import React from 'react';
import { ISSUE_TRACKER_LINK, SOURCE_CODE_LINK } from '../Navigation/Navigation';
import OutboundLink from '../Navigation/OutboundLink';

export default class DropzoneGuide extends React.PureComponent {
  private static GATHER_DATA_LINK = 'https://github.com/drauf/watson/blob/master/README.md#gathering-thread-dumps';

  private stopPropagation = (event: React.MouseEvent) => {
    // prevent opening the dropzone popup when clicking on the navigation links
    event.stopPropagation();
  };

  public render(): JSX.Element {
    return (
      <div id="dropzone-guide" role="complementary" onClick={this.stopPropagation}>
        <h5>
          For the full experience, you should gather thread dumps along with
          {' '}
          <i>top</i>
          {' '}
          outputs.
        </h5>
        <span>
          See:
          {' '}
          <OutboundLink to={DropzoneGuide.GATHER_DATA_LINK}>
            How to gather data
          </OutboundLink>
        </span>

        <p>
          Watson works fully offline. No files will leave your machine.
        </p>

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
  }
}
