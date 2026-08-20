import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import React, { type JSX } from 'react';
import Thread from '../../types/Thread';
import StackTrace from '../common/StackTrace';

interface Props {
  thread: Thread;
}

export default class ThreadDetailsBody extends React.PureComponent<Props> {
  private static renderWaitingFor = (thread: Thread) => (
    <div className="thread-details-section">
      <Heading as="h5" size="xsmall">Waiting for</Heading>

      {!thread.lockWaitingFor
      && <Text>This thread is not waiting for notification on any lock</Text>}

      {thread.lockWaitingFor
      && (
        <Text>
          This thread is waiting for notification on lock [
          {thread.lockWaitingFor.id}
          ]
          {thread.lockWaitingFor.owner
            ? (
              <>
                {' '}
                owned by
                {' '}
                <i>{thread.lockWaitingFor.owner.name}</i>
              </>
            )
            : <> without an owner</>}
        </Text>
      )}
    </div>
  );

  private static renderLocksHeld = (thread: Thread) => (
    <div className="thread-details-section">
      <Heading as="h5" size="xsmall">Locks held</Heading>

      {thread.locksHeld.length === 0
      && <Text>This thread does not hold any locks</Text>}

      {thread.locksHeld.length > 0
      && (
        <Text>
          This thread holds [
          {thread.locksHeld.map((lock) => lock.id).join(', ')}
          ]
        </Text>
      )}
    </div>
  );

  private static renderStackTrace = (thread: Thread) => (
    <StackTrace stackTrace={thread.stackTrace} linesToConsider={0} />
  );

  public override render(): JSX.Element {
    const { thread } = this.props;

    return (
      <div className="details-body">
        {ThreadDetailsBody.renderWaitingFor(thread)}
        {ThreadDetailsBody.renderLocksHeld(thread)}
        {ThreadDetailsBody.renderStackTrace(thread)}
      </div>
    );
  }
}
