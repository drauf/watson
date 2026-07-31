import React, { type JSX } from 'react';
import Lozenge from '@atlaskit/lozenge/new';
import GroupHeader from './common/GroupHeader';
import CollapsableGroup from './CollapsableGroup';
import './Container.css';

interface StoryProps {
  header: React.ReactElement;
}

const GroupStory = ({ header }: StoryProps): JSX.Element => (
  <main>
    <section id="settings" style={{ width: '100%' }}>
      <CollapsableGroup
        header={header}
        content={(
          <p>
            The group body contains representative analysis details. It is hidden until the group is expanded.
          </p>
        )}
      />
    </section>
  </main>
);

export const Basic = (): JSX.Element => (
  <GroupStory header={<span>Thread pool worker group</span>} />
);

export const RichHeader = (): JSX.Element => (
  <GroupStory
    header={(
      <GroupHeader
        leading={<Lozenge appearance="neutral" trailingMetric="12">Threads</Lozenge>}
        title="org.apache.lucene.search.IndexSearcher.search(IndexSearcher.java:123)"
        metadata={(
          <>
            <Lozenge appearance="accent-yellow">Database</Lozenge>
            <Lozenge appearance="accent-yellow">Lucene</Lozenge>
          </>
        )}
      />
    )}
  />
);
