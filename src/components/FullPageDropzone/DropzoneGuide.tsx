import React from 'react';
import OutboundLink from './OutboundLink';

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

      </div>
    );
  }
}
