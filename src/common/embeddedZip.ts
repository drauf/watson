import {
  Unzip, UnzipInflate, type UnzipDecoderConstructor,
} from 'fflate';

const textFile = (name: string): boolean => name.endsWith('.txt');
const EMBEDDED_ZIP_INPUT_CHUNK_SIZE = 4 * 1024 * 1024;

const zipSignature = (zipBytes: Uint8Array): boolean => (
  zipBytes.length >= 4
  && zipBytes[0] === 0x50
  && zipBytes[1] === 0x4B
  && (
    (zipBytes[2] === 0x03 && zipBytes[3] === 0x04)
    || (zipBytes[2] === 0x05 && zipBytes[3] === 0x06)
  )
);

export const decodeBase64Zip = (base64Zip: string): Uint8Array => {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(base64Zip);
  }

  const binaryZip = atob(base64Zip);
  const zipBytes = new Uint8Array(binaryZip.length);

  for (let index = 0; index < binaryZip.length; index += 1) {
    zipBytes[index] = binaryZip.charCodeAt(index);
  }

  return zipBytes;
};

export interface TextZipExtractionMetrics {
  fileAssemblyMilliseconds: number;
}

export async function* extractTextFilesFromZipStream(
  zipBytes: Uint8Array,
  unzipDecoder: UnzipDecoderConstructor = UnzipInflate,
  metrics?: TextZipExtractionMetrics,
): AsyncGenerator<File> {
  if (!zipSignature(zipBytes)) {
    throw new Error('Invalid ZIP archive');
  }

  const extractionMetrics = metrics;
  const completedFiles: File[] = [];
  let activeFiles = 0;
  let extractionError: Error | undefined;
  let wakeConsumer: (() => void) | undefined;
  const notifyConsumer = () => {
    wakeConsumer?.();
    wakeConsumer = undefined;
  };
  const waitForCompletedFile = () => new Promise<void>((resolve) => {
    wakeConsumer = resolve;
  });
  const drainCompletedFiles = (): File[] => completedFiles.splice(0);

  const unzipper = new Unzip((entry) => {
    if (!textFile(entry.name)) {
      return;
    }

    activeFiles++;
    const entryToExtract = entry;
    const chunks: Uint8Array[] = [];
    entryToExtract.ondata = (error, chunk, final) => {
      if (error) {
        extractionError = error instanceof Error ? error : new Error('Embedded ZIP extraction failed');
        activeFiles--;
        notifyConsumer();
        return;
      }

      chunks.push(chunk);
      if (final) {
        const assemblyStartedAt = performance.now();
        const totalLength = chunks.reduce((total, currentChunk) => total + currentChunk.length, 0);
        const fileBytes = new Uint8Array(totalLength);
        let offset = 0;
        chunks.forEach((currentChunk) => {
          fileBytes.set(currentChunk, offset);
          offset += currentChunk.length;
        });
        completedFiles.push(new File([fileBytes.buffer], entryToExtract.name));
        if (extractionMetrics) {
          extractionMetrics.fileAssemblyMilliseconds += performance.now() - assemblyStartedAt;
        }
        activeFiles--;
        notifyConsumer();
      }
    };
    entryToExtract.start();
  });

  unzipper.register(unzipDecoder);

  for (let offset = 0; offset < zipBytes.length; offset += EMBEDDED_ZIP_INPUT_CHUNK_SIZE) {
    const end = Math.min(offset + EMBEDDED_ZIP_INPUT_CHUNK_SIZE, zipBytes.length);
    unzipper.push(zipBytes.subarray(offset, end), end === zipBytes.length);

    for (const file of drainCompletedFiles()) {
      yield file;
    }
  }

  while (activeFiles > 0) {
    // Remaining entries may complete asynchronously after the final ZIP input batch
    // eslint-disable-next-line no-await-in-loop
    await waitForCompletedFile();
    if (extractionError) {
      throw extractionError;
    }
    for (const file of drainCompletedFiles()) {
      yield file;
    }
  }

  if (extractionError) {
    throw extractionError;
  }
}

export const extractTextFilesFromZip = async (
  zipBytes: Uint8Array,
  unzipDecoder: UnzipDecoderConstructor = UnzipInflate,
  metrics?: TextZipExtractionMetrics,
): Promise<File[]> => {
  const files: File[] = [];
  for await (const file of extractTextFilesFromZipStream(zipBytes, unzipDecoder, metrics)) {
    files.push(file);
  }
  return files;
};
