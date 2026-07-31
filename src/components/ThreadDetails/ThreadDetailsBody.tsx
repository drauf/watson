import Heading from '@atlaskit/heading';
import Text from '@atlaskit/primitives/text';
import React, { CSSProperties, type JSX } from 'react';
import getColorForStackLine from '../../common/getColorForStackLine';
import Thread from '../../types/Thread';

interface Props {
  thread: Thread;
}

export default class ThreadDetailsBody extends React.PureComponent<Props> {
  private static renderWaitingFor = (thread: Thread) => (
    <div>
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
    <div>
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

  private static getLineStyles = (line: string): CSSProperties => ({ backgroundColor: getColorForStackLine(line) });

  private static renderStackTrace = (thread: Thread) => {
    const occurrences = new Map<string, number>();

    return (
      <div className="stacktrace-container">
        <Heading as="h5" size="xsmall">Stack trace</Heading>

        {thread.stackTrace.map((line) => {
          const occurrence = (occurrences.get(line) ?? 0) + 1;
          occurrences.set(line, occurrence);

          return <code key={`${line}:${occurrence}`} style={ThreadDetailsBody.getLineStyles(line)}>{line}</code>;
        })}
      </div>
    );
  };

  public override render(): JSX.Element {
    const { thread } = this.props;

    return (
      <>
        <div className="details-body">
          {ThreadDetailsBody.renderWaitingFor(thread)}
          {ThreadDetailsBody.renderLocksHeld(thread)}
        </div>

        {ThreadDetailsBody.renderStackTrace(thread)}
      </>
    );
  }
}
