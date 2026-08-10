import { render, screen } from '@testing-library/react';
import { token } from '@atlaskit/tokens';
import Thread from '../../types/Thread';
import SingleThreadDetails from './SingleThreadDetails';

describe('SingleThreadDetails', () => {
  it('colors each displayed stack line by package group', () => {
    const thread = new Thread(1, 'http-nio-8080-exec-1');
    thread.stackTrace.push(
      'com.atlassian.jira.issue.IssueManager.getIssue',
      'java.lang.Thread.run',
    );

    render(
      <SingleThreadDetails
        maxDifferingLines={2}
        showStackTrace
        thread={thread}
      />,
    );

    expect(screen.getByText('com.atlassian.jira.issue.IssueManager.getIssue')).toHaveStyle({
      backgroundColor: token('color.background.accent.blue.subtler'),
    });
    expect(screen.getByText('java.lang.Thread.run')).toHaveStyle({
      backgroundColor: token('color.background.accent.gray.subtler'),
    });
  });
});
