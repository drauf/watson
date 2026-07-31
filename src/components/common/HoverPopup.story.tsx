import Button from '@atlaskit/button/new';
import React from 'react';
import HoverPopup from './HoverPopup';

const popupDetails = (
  <dl>
    <dt>Thread</dt>
    <dd>http-nio-8080-exec-12</dd>
    <dt>Frame</dt>
    <dd><code>org.apache.lucene.search.IndexSearcher.search</code></dd>
  </dl>
);

const Basic = (): JSX.Element => {
  const [detailsToggled, setDetailsToggled] = React.useState(false);

  return (
    <main>
      <HoverPopup content={popupDetails}>
        <Button>Show thread details</Button>
      </HoverPopup>
      {' '}
      <Button onClick={() => setDetailsToggled(true)}>Toggle details</Button>
      {detailsToggled && <p>Details toggled</p>}
    </main>
  );
};

export default Basic;
