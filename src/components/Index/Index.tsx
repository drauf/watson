import React from 'react';

import EmbeddedDataIndex from '../EmbeddedDataIndex/EmbeddedDataIndex';
import FullPageDropzone from '../FullPageDropzone/FullPageDropzone';

export default class Index extends React.PureComponent<unknown, { b64zip: string | undefined }> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      b64zip: undefined,
    };
  }

  componentDidMount() {
    let b64zip:string;
    const embeddedFileInput = document.getElementById('embedded-file-input');
    if (embeddedFileInput) {
      b64zip = embeddedFileInput.getAttribute('value')!;
      if (b64zip) this.setState((state) => ({ ...state, b64zip }));
    }
  }

  public render(): JSX.Element {
    const { b64zip } = this.state;
    if (b64zip) {
      return <EmbeddedDataIndex b64zip={b64zip} />;
    }

    return <FullPageDropzone />;
  }
}
