import { token } from '@atlaskit/tokens';
import { render, screen } from '@testing-library/react';
import Lock from '../../types/Lock';
import Thread from '../../types/Thread';
import ThreadDetailsBody from './ThreadDetailsBody';

describe('ThreadDetailsBody', () => {
  it('explains when a thread is not waiting for or holding locks', () => {
    render(<ThreadDetailsBody thread={new Thread(1, 'worker')} />);

    expect(screen.getByText('This thread is not waiting for notification on any lock')).toBeInTheDocument();
    expect(screen.getByText('This thread does not hold any locks')).toBeInTheDocument();
  });

  it('explains when a waiting lock has no owner', () => {
    const thread = new Thread(1, 'worker');
    thread.lockWaitingFor = new Lock('0x01', 'java.lang.Object');

    render(<ThreadDetailsBody thread={thread} />);

    expect(screen.getByText('This thread is waiting for notification on lock [0x1] without an owner')).toBeInTheDocument();
  });

  it('renders waiting lock ownership, held locks, and repeated stack frames', () => {
    const owner = new Thread(2, 'owner');
    const thread = new Thread(1, 'worker');
    thread.lockWaitingFor = new Lock('0x01', 'java.lang.Object', owner);
    thread.locksHeld.push(new Lock('0x02', 'java.util.concurrent.locks.ReentrantLock'));
    thread.stackTrace.push(
      'com.atlassian.jira.issue.IssueManager.getIssue',
      'com.atlassian.jira.issue.IssueManager.getIssue',
    );

    render(<ThreadDetailsBody thread={thread} />);

    expect(screen.getByText((_, element) => element?.textContent === 'This thread is waiting for notification on lock [0x1] owned by owner')).toBeInTheDocument();
    expect(screen.getByText('This thread holds [0x2]')).toBeInTheDocument();
    const stackFrames = screen.getAllByText('com.atlassian.jira.issue.IssueManager.getIssue');
    expect(stackFrames).toHaveLength(2);
    for (const stackFrame of stackFrames) {
      expect(stackFrame).toHaveStyle({
        backgroundColor: token('color.background.accent.blue.subtlest'),
        color: token('color.text.accent.blue'),
      });
    }
  });
});
