import React from 'react';
import OutboundLink from './OutboundLink';

interface Props {
  // This component doesn't receive any props
}

export default class DropzoneGuide extends React.PureComponent<Props> {
  private static SOURCE_CODE_LINK = 'https://github.com/drauf/watson';

  private static SLACK_CONNECT_DOCS_LINK = 'https://slack.com/help/articles/1500001422062-Use-Slack-Connect-to-start-a-DM-with-someone-at-another-company#send-an-invitation';

  private static stopPropagation = (event: React.MouseEvent) => {
    // prevent opening the dropzone popup when clicking on the navigation links
    event.stopPropagation();
  };

  public override render(): JSX.Element {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <div
        id="dropzone-guide"
        role="complementary"
        onClick={DropzoneGuide.stopPropagation}
      >
        <h5>
          Watson analyzes JVM thread dumps and CPU usage, filtering out idle threads to show you what matters most.
        </h5>

        <p>
          It runs entirely in your browser - your files never leave your machine.
        </p>

        <p>
          Found a bug or have a suggestion?
          {' '}
          <OutboundLink to={DropzoneGuide.SOURCE_CODE_LINK}>
            GitHub
          </OutboundLink>
          ,
          {' '}
          <OutboundLink to={DropzoneGuide.SLACK_CONNECT_DOCS_LINK}>
            Slack
          </OutboundLink>
          , or
          {' '}
          <a href="mailto:drauf@atlassian.com">email</a>
          {' '}
          (drauf@atlassian.com).
        </p>
      </div>
    );
  }
}
