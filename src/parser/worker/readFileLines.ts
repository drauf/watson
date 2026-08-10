export type BytesReadCallback = (bytesRead: number) => void;

export async function* readFileLines(file: File, onBytesRead: BytesReadCallback): AsyncGenerator<string> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let remaining = '';

  try {
    while (true) {
      // eslint-disable-next-line no-await-in-loop -- Reading the stream is the loop's work
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      onBytesRead(bytesRead);
      remaining += decoder.decode(value, { stream: true });

      let newlineIndex = remaining.indexOf('\n');
      while (newlineIndex !== -1) {
        yield remaining.slice(0, newlineIndex).replace(/\r$/, '');
        remaining = remaining.slice(newlineIndex + 1);
        newlineIndex = remaining.indexOf('\n');
      }
    }

    remaining += decoder.decode();
    if (remaining) {
      yield remaining.replace(/\r$/, '');
    }
  } finally {
    reader.releaseLock();
  }
}
