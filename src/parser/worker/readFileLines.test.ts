import { readFileLines } from './readFileLines';

const createStreamingFile = (chunks: string[]): { file: File; stream: ReadableStream<Uint8Array> } => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  const file = new File([], 'input.txt', { type: 'text/plain' });
  Object.defineProperty(file, 'stream', { value: () => stream });
  return { file, stream };
};

const collectLines = async (file: File): Promise<{ bytesRead: number[]; lines: string[] }> => {
  const bytesRead: number[] = [];
  const lines: string[] = [];
  for await (const line of readFileLines(file, (bytes) => bytesRead.push(bytes))) {
    lines.push(line);
  }
  return { bytesRead, lines };
};

describe('readFileLines', () => {
  it('preserves CRLF lines split across stream chunks', async () => {
    const { file } = createStreamingFile(['first\r', '\nsecond\nthird']);

    await expect(collectLines(file)).resolves.toEqual({
      bytesRead: [6, 19],
      lines: ['first', 'second', 'third'],
    });
  });

  it('returns a final line without a newline and releases the reader lock', async () => {
    const { file, stream } = createStreamingFile(['only line']);

    await expect(collectLines(file)).resolves.toEqual({
      bytesRead: [9],
      lines: ['only line'],
    });
    expect(stream.locked).toBe(false);
  });
});
