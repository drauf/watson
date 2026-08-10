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

    expect(screen.getByText('com.atlassian.jira.issue.IssueManager.getIssue')).toHaveStyle({
      backgroundColor: token('color.background.accent.blue.subtler'),
    });
    expect(screen.getByText('java.lang.Thread.run')).toHaveStyle({
      backgroundColor: token('color.background.accent.gray.subtler'),
    });
  });
});
