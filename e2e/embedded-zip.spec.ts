import { expect, test } from '@playwright/test';
import { strToU8, zipSync } from 'fflate';
import type * as EmbeddedZip from '../src/common/embeddedZip';

test('extracts embedded text files with the browser worker decoder', async ({ page }) => {
  const zipBytes = zipSync({
    'threaddumps/THREAD-DUMP-1.txt': strToU8('thread dump 1'),
    'threaddumps/THREAD-DUMP-2.txt': strToU8('thread dump 2'),
    'metadata/readme.md': strToU8('ignored'),
    'CPU-USAGE-DUMP-1.txt': strToU8('cpu usage 1'),
    'CPU-USAGE-DUMP-2.txt': strToU8('cpu usage 2'),
  });
  const base64Zip = await page.evaluate((bytes) => btoa(String.fromCharCode(...bytes)), Array.from(zipBytes));

  await page.goto('/');

  const extractedFiles = await page.evaluate(async (encodedZip) => {
    const modulePath = '/src/common/embeddedZip.ts';
    const { decodeBase64Zip, extractTextFilesFromZip } = await import(/* @vite-ignore */ modulePath) as typeof EmbeddedZip;
    const files = await extractTextFilesFromZip(decodeBase64Zip(encodedZip));
    return files.map(({ name, size }) => ({ name, size }));
  }, base64Zip);

  expect(extractedFiles).toEqual([
    { name: 'threaddumps/THREAD-DUMP-1.txt', size: 13 },
    { name: 'threaddumps/THREAD-DUMP-2.txt', size: 13 },
    { name: 'CPU-USAGE-DUMP-1.txt', size: 11 },
    { name: 'CPU-USAGE-DUMP-2.txt', size: 11 },
  ]);
});
