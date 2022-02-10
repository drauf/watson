import React from 'react';
import OutboundLink from './OutboundLink';

export default class DropzoneGuide extends React.PureComponent {
  private static GATHER_DATA_LINK = 'https://bitbucket.org/atlassianlabs/atlassian-support/src/master/';

  private static SLACK_CONNECT_DOCS_LINK = 'https://slack.com/help/articles/1500001422062-Use-Slack-Connect-to-start-a-DM-with-someone-at-another-company#send-an-invitation';

  private static stopPropagation = (event: React.MouseEvent) => {
    // prevent opening the dropzone popup when clicking on the navigation links
    event.stopPropagation();
  };

  public render(): JSX.Element {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
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

        <p>
          Best-effort support -
          {' '}
          <OutboundLink to={DropzoneGuide.SLACK_CONNECT_DOCS_LINK}>
            DM me on Slack
          </OutboundLink>
          {' '}
          at drauf at atlassian.com
        </p>
      </div>
    );
  }
}
