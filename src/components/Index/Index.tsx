import React from 'react';

import EmbeddedDataIndex from '../EmbeddedDataIndex/EmbeddedDataIndex';
import FullPageDropzone from '../FullPageDropzone/FullPageDropzone';

interface Props {
  // This component doesn't receive any props
}

interface State {
  b64zip: string | undefined;
}

export default class Index extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      b64zip: undefined,
    };
  }

  override componentDidMount() {
    const embeddedFileInput = document.getElementById('embedded-file-input');
    if (embeddedFileInput) {
      const b64zip = embeddedFileInput.getAttribute('value');
      if (b64zip) this.setState((state) => ({ ...state, b64zip }));
    }
  }

  public override render(): JSX.Element {
    const { b64zip } = this.state;
    if (b64zip) {
      return <EmbeddedDataIndex b64zip={b64zip} />;
    }

    return <FullPageDropzone />;
  }
}
