import Lozenge from '@atlaskit/lozenge/new';
import Text from '@atlaskit/primitives/text';
import type { JSX } from 'react';
import { getThreadStatusAppearance } from '../../common/threadStatusAppearance';
import Thread from '../../types/Thread';
import { getCpuUsageLozengeAppearance } from '../CpuConsumers/cpuUsageAppearance';
import StackTrace from '../common/StackTrace';
import './ThreadStackPopupContent.css';

interface Props {
  stackPreviewLines: number;
  thread: Thread;
}

const ThreadStackPopupContent = ({ stackPreviewLines, thread }: Props): JSX.Element => {
  const stackPreview = thread.stackTrace.slice(0, stackPreviewLines);
  const remainingLines = thread.stackTrace.length - stackPreview.length;

  const remainingLineLabel = remainingLines === 1 ? 'line' : 'lines';
  const hasCpuUsage = thread.hasCpuUsage || thread.cpuUsage !== '0.00' || thread.runningFor !== '0:00.00';

  return (
    <>
      <dl>
        <dt>Time</dt>
        <dd>{Thread.getFormattedTime(thread)}</dd>
        <dt>Thread</dt>
        <dd>{thread.name}</dd>
      </dl>
      <div className="thread-stack-popup-metadata">
        <Lozenge
          appearance={getThreadStatusAppearance(thread.status)}
          trailingMetric={thread.status.toLocaleUpperCase()}
        >
          Thread state
        </Lozenge>
        {hasCpuUsage && (
          <>
            <Lozenge
              appearance={getCpuUsageLozengeAppearance(parseFloat(thread.cpuUsage))}
              trailingMetric={`${thread.cpuUsage}%`}
            >
              CPU usage
            </Lozenge>
            <Lozenge appearance="neutral" trailingMetric={thread.runningFor}>Running for</Lozenge>
          </>
        )}
        <Lozenge appearance="neutral" trailingMetric={`${thread.lockWaitingFor ? 1 : 0}`}>
          Locks waiting for
        </Lozenge>
        <Lozenge appearance="neutral" trailingMetric={`${thread.locksHeld.length}`}>Locks held</Lozenge>
      </div>
      <hr />
      <StackTrace stackTrace={stackPreview} linesToConsider={0} />
      {remainingLines > 0 && (
        <Text as="p" id="thread-stack-popup-more">
          +
          {remainingLines}
          {' '}
          more stack
          {' '}
          {remainingLineLabel}
        </Text>
      )}
      <Text as="p" weight="semibold" id="thread-stack-popup-action">Click to open thread details in a new window</Text>
    </>
  );
};

export default ThreadStackPopupContent;
