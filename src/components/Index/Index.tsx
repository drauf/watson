import React, { type JSX } from 'react';

import EmbeddedDataIndex from '../EmbeddedDataIndex/EmbeddedDataIndex';
import FullPageDropzone from '../FullPageDropzone/FullPageDropzone';

interface State {
  hasEmbeddedData: boolean;
}

export default class Index extends React.PureComponent<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      hasEmbeddedData: Boolean(document.getElementById('embedded-file-input')?.getAttribute('value')),
    };
  }

  public override render(): JSX.Element {
    const { hasEmbeddedData } = this.state;
    if (hasEmbeddedData) {
      return <EmbeddedDataIndex />;
    }

    return <FullPageDropzone />;
  }
}
