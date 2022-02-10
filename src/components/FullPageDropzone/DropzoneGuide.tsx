import React from 'react';
import { ISSUE_TRACKER_LINK, SOURCE_CODE_LINK } from '../Navigation/Navigation';
import OutboundLink from '../Navigation/OutboundLink';

export default class DropzoneGuide extends React.PureComponent {
  private static GATHER_DATA_LINK = 'https://bitbucket.org/atlassianlabs/atlassian-support/src/master/';

  private static stopPropagation = (event: React.MouseEvent) => {
    // prevent opening the dropzone popup when clicking on the navigation links
    event.stopPropagation();
  };

  public render(): JSX.Element {
    return (
      <div id="dropzone-guide" role="complementary" onClick={DropzoneGuide.stopPropagation}>
        <h5>
          Watson works fully inside your browser. No files will leave your machine.
        </h5>

        <p>
          For full functionality, gather thread dumps and
          {' '}
          <i>top</i>
          {' '}
          outputs, e.g. with the
          {' '}
          <OutboundLink to={DropzoneGuide.GATHER_DATA_LINK}>
            Atlassian Support scripts
          </OutboundLink>
          .
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
