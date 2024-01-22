import React from 'react';
import OutboundLink from './OutboundLink';

export default class DropzoneGuide extends React.PureComponent {
  private static SUPPORT_ZIP_GUIDE_LINK = 'https://confluence.atlassian.com/support/create-a-support-zip-790796819.html';

  private static GATHER_DATA_LINK = 'https://bitbucket.org/atlassianlabs/atlassian-support/src/master/';

  private static SOURCE_CODE_LINK = 'https://github.com/drauf/watson';

  private static SCREENSHOTS_LINK = 'https://github.com/drauf/watson/blob/main/screenshots.md';

  private static SLACK_CONNECT_DOCS_LINK = 'https://slack.com/help/articles/1500001422062-Use-Slack-Connect-to-start-a-DM-with-someone-at-another-company#send-an-invitation';

  private static stopPropagation = (event: React.MouseEvent) => {
    // prevent opening the dropzone popup when clicking on the navigation links
    event.stopPropagation();
  };

  public render(): JSX.Element {
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      <div
        id="dropzone-guide"
        role="complementary"
        onClick={DropzoneGuide.stopPropagation}
      >
        <h5>
          Watson is your go-to tool for analyzing JVM thread dumps and CPU
          usage.
          <br />
          It filters out the idle threads and presents you with the most
          relevant information.
        </h5>

        <h5>
          Watson operates completely within your browser, ensuring your files
          stay right where they belong - on your machine.
        </h5>

        <hr />

        <p>
          To get the most out of Watson, capture Java thread dumps and top
          outputs. Two ways to do this:
          <ul>
            <li>
              <OutboundLink to={DropzoneGuide.SUPPORT_ZIP_GUIDE_LINK}>
                Generate a support zip
              </OutboundLink>
              {' '}
              and load thread dumps from the jfr-bundle directory,
            </li>
            <li>
              or manually collect the data, even for non-Atlassian applications,
              using the
              {' '}
              <OutboundLink to={DropzoneGuide.GATHER_DATA_LINK}>
                Atlassian Support scripts
              </OutboundLink>
              .
            </li>
          </ul>
        </p>

        <hr />

        <p>
          To learn more or contribute, visit our
          {' '}
          <OutboundLink to={DropzoneGuide.SOURCE_CODE_LINK}>
            GitHub repo
          </OutboundLink>
          .
          {' '}
          <strong>
            See screenshots of Watson
            {' '}
            <OutboundLink to={DropzoneGuide.SCREENSHOTS_LINK}>
              here
            </OutboundLink>
          </strong>
          .
        </p>

        <p>
          For any assistance,
          {' '}
          <OutboundLink to={DropzoneGuide.SLACK_CONNECT_DOCS_LINK}>
            DM me on Slack
          </OutboundLink>
          {' '}
          or send me an email at drauf at atlassian.com.
        </p>
      </div>
    );
  }
}
