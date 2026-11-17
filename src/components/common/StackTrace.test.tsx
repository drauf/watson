import { render, screen } from '@testing-library/react';
import { token } from '@atlaskit/tokens';
import StackTrace from './StackTrace';

describe('StackTrace', () => {
  it('colors each stack line by package group', () => {
    render(
      <StackTrace
        linesToConsider={0}
        stackTrace={[
          'com.atlassian.jira.issue.IssueManager.getIssue',
          'java.lang.Thread.run',
        ]}
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
