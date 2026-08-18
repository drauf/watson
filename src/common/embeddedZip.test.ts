import { strToU8, UnzipInflate, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { decodeBase64Zip, extractTextFilesFromZip } from './embeddedZip';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

describe('embedded ZIP extraction', () => {
  it('decodes base64 ZIP bytes', () => {
    const zipBytes = zipSync({ 'thread-dump.txt': strToU8('thread dump') });

    expect(decodeBase64Zip(toBase64(zipBytes))).toEqual(zipBytes);
  });

  it('extracts only text files while preserving nested entry names', async () => {
    const zipBytes = zipSync({
      'threaddumps/THREAD-DUMP-1.txt': strToU8('thread dump'),
      'metadata/readme.md': strToU8('ignored'),
      'CPU-USAGE-DUMP-1.txt': strToU8('cpu usage'),
    });

    const files = await extractTextFilesFromZip(zipBytes, UnzipInflate);

    expect(files.map((file) => file.name)).toEqual([
      'threaddumps/THREAD-DUMP-1.txt',
      'CPU-USAGE-DUMP-1.txt',
    ]);
    expect(files.map((file) => file.type)).toEqual(['', '']);
    expect(files.map((file) => file.size)).toEqual([11, 9]);
  });

  it('extracts an entry spanning an input batch', async () => {
    const contents = new Uint8Array(5 * 1024 * 1024);
    for (let index = 0; index < contents.length; index += 1) {
      contents[index] = index % 251;
    }
    const zipBytes = zipSync({ 'large-thread-dump.txt': contents }, { level: 0 });

    const files = await extractTextFilesFromZip(zipBytes, UnzipInflate);

    expect(files).toHaveLength(1);
    expect(files[0]).toMatchObject({ name: 'large-thread-dump.txt', size: contents.length });
  });

  it('returns no files when the archive has no text entries', async () => {
    const zipBytes = zipSync({ 'metadata/readme.md': strToU8('ignored') });

    await expect(extractTextFilesFromZip(zipBytes, UnzipInflate)).resolves.toEqual([]);
  });

  it('rejects invalid ZIP data', async () => {
    await expect(extractTextFilesFromZip(new Uint8Array([1, 2, 3]), UnzipInflate))
      .rejects.toThrow();
  });
});
