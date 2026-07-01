import React from 'react';
import OutboundLink from '../FullPageDropzone/OutboundLink';
import './HelpPage.css';

const SOURCE_CODE_LINK = 'https://github.com/drauf/watson';
const SLACK_CONNECT_DOCS_LINK = 'https://slack.com/help/articles/1500001422062-Use-Slack-Connect-to-start-a-DM-with-someone-at-another-company#send-an-invitation';
const EMAIL = 'drauf@atlassian.com';

const HelpPage: React.FC = () => (
  <main className="help-page">
    <h2>Glad you&apos;re here</h2>

    <p>
      Watson is a passion project, and I genuinely love hearing from the people who use it.
      Questions, bug reports, and ideas for improvements are all very welcome - you are never
      bothering me. If something is confusing, broken, or missing, I would much rather hear
      about it than not, and I am always happy to help or make improvements.
    </p>

    <p>
      Watson runs entirely in your browser - your thread dumps and CPU data never leave your
      machine.
    </p>

    <p>Here is how to reach me:</p>

    <ul>
      <li>
        <OutboundLink to={SLACK_CONNECT_DOCS_LINK}>Slack</OutboundLink>
        {' '}
        - start a direct message with me
      </li>
      <li>
        <OutboundLink to={SOURCE_CODE_LINK}>GitHub</OutboundLink>
        {' '}
        - open an issue or a pull request
      </li>
      <li>
        <a href={`mailto:${EMAIL}`}>email</a>
        {' '}
        -
        {' '}
        {EMAIL}
      </li>
    </ul>

    <p>Thanks for using Watson - I hope it makes your day a little easier.</p>
  </main>
);

export default HelpPage;
