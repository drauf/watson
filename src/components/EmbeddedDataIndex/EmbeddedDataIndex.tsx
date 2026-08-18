import Heading from '@atlaskit/heading';
import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { decodeBase64Zip, extractTextFilesFromZipStream } from '../../common/embeddedZip';
import FullPageError from '../Errors/FullPageError';
import { setParsedData } from '../../common/threadDumpsStorageService';
import ThreadDump from '../../types/ThreadDump';
import WorkerParser from '../../parser/WorkerParser';

interface State {
  parsedDataKey: string | undefined;
  hasCpuUsageInfo: boolean;
  loadingEmbeddedData: boolean;
  errorMessage: string | undefined;
}

export const consumeEmbeddedZip = (): Uint8Array => {
  const embeddedFileInput = document.getElementById('embedded-file-input');
  if (!embeddedFileInput) {
    throw new Error('Embedded ZIP data is unavailable');
  }

  try {
    const base64Zip = embeddedFileInput.getAttribute('value');
    if (!base64Zip) {
      throw new Error('Embedded ZIP data is empty');
    }
    return decodeBase64Zip(base64Zip);
  } finally {
    embeddedFileInput.remove();
  }
};

export default class EmbeddedDataIndex extends React.PureComponent<Record<string, never>, State> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      parsedDataKey: undefined,
      hasCpuUsageInfo: false,
      loadingEmbeddedData: true,
      errorMessage: undefined,
    };
  }

  override async componentDidMount(): Promise<void> {
    try {
      const zipBytes = consumeEmbeddedZip();
      const parser = new WorkerParser(this.onParsed);
      await parser.parseFileSource({
        totalFiles: undefined,
        totalBytes: zipBytes.byteLength,
        files: extractTextFilesFromZipStream(zipBytes),
      });
    } catch (error) {
      this.setState({
        loadingEmbeddedData: false,
        errorMessage: error instanceof Error ? error.message : 'Unable to load embedded data',
      });
    }
  }

  private onParsed = async (threadDumps: ThreadDump[]): Promise<void> => {
    const key = await setParsedData(threadDumps);
    this.setState((state) => ({
      ...state,
      parsedDataKey: key,
      hasCpuUsageInfo: threadDumps.some((dump) => dump.threads.some((thread) => thread.cpuUsage !== '0.00')),
      loadingEmbeddedData: false,
    }));
  };

  public override render(): JSX.Element {
    const {
      errorMessage, parsedDataKey, hasCpuUsageInfo, loadingEmbeddedData,
    } = this.state;
    if (errorMessage) {
      return <FullPageError title="Unable to load embedded data" message={errorMessage} />;
    }

    if (loadingEmbeddedData) {
      return <Heading as="h1" size="xlarge">Loading...</Heading>;
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
      <Heading as="h1" size="xlarge">Loading...</Heading>
    );
  }
}
