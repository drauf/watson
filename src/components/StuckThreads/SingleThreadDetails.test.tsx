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

    const jiraFrame = screen.getByText('com.atlassian.jira.issue.IssueManager.getIssue');
    expect(jiraFrame.style.backgroundColor).toBe(token('color.background.accent.blue.subtlest'));
    expect(jiraFrame.style.color).toBe(token('color.text.accent.blue'));

    const javaFrame = screen.getByText('java.lang.Thread.run');
    expect(javaFrame.style.backgroundColor).toBe(token('color.background.accent.gray.subtlest'));
    expect(javaFrame.style.color).toBe(token('color.text.accent.gray'));
  });
});
