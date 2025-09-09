import React from 'react';
import { Navigate } from 'react-router-dom';
import JSZip from 'jszip';
import { setParsedData } from '../../common/threadDumpsStorageService';
import Parser from '../../parser/Parser';
import ThreadDump from '../../types/ThreadDump';

type State = {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
  loadingEmbeddedData: boolean;
  b64zip: string;
};

type Props = {
  b64zip: string;
};

export default class EmbeddedDataIndex extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      parsedDataKey: undefined,
      hasCpuUsageInfo: false,
      loadingEmbeddedData: true,
      b64zip: props.b64zip,
    };
  }

  override async componentDidMount(): Promise<void> {
    const { b64zip } = this.state;
    const zipBytes = atob(b64zip);
    const zipFile = new File([new Uint8Array(zipBytes.split('').map((c) => c.charCodeAt(0)))], 'embedded.zip');
    const zip = await new JSZip().loadAsync(zipFile);
    const files = await Promise.all(zip.file(/.*\.txt/)
      .map(async (zipEntry) => {
        const blob = await zipEntry.async('blob');
        return new File([blob], zipEntry.name);
      }));

    const parser = new Parser(this.onParsed);
    parser.parseFiles(files);
  }

  private onParsed = (threadDumps: ThreadDump[]): void => {
    const key = setParsedData(threadDumps);
    this.setState((state) => ({
      ...state,
      parsedDataKey: key,
      hasCpuUsageInfo: threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00')),
      loadingEmbeddedData: false,
    }));
  };

  public override render(): JSX.Element {
    const { parsedDataKey, hasCpuUsageInfo, loadingEmbeddedData } = this.state;
    if (loadingEmbeddedData) {
      return <h1>Loading...</h1>;
    }

    if (parsedDataKey) {
      if (hasCpuUsageInfo) {
        return (
          <Navigate to={`/${parsedDataKey}/summary`} />
        );
      }
      return (
        <Navigate to={`/${parsedDataKey}/similar-stacks`} />
      );
    }

    return (
      <h1>Loading...</h1>
    );
  }
}
