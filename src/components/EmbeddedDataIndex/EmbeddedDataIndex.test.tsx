import { strToU8, zipSync } from 'fflate';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import {
  afterEach, describe, expect, it,
} from 'vitest';
import EmbeddedDataIndex, { consumeEmbeddedZip } from './EmbeddedDataIndex';

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));

const appendEmbeddedZip = (base64Zip: string): HTMLElement => {
  const input = document.createElement('input');
  input.id = 'embedded-file-input';
  input.setAttribute('value', base64Zip);
  document.body.append(input);
  return input;
};

describe('consumeEmbeddedZip', () => {
  afterEach(() => {
    document.getElementById('embedded-file-input')?.remove();
  });

  it('decodes and removes the embedded source element', () => {
    const zipBytes = zipSync({ 'thread-dump.txt': strToU8('thread dump') });
    const input = appendEmbeddedZip(toBase64(zipBytes));

    expect(consumeEmbeddedZip()).toEqual(zipBytes);
    expect(input.isConnected).toBe(false);
  });

  it('removes an empty embedded source element before failing', () => {
    const input = appendEmbeddedZip('');

    expect(() => consumeEmbeddedZip()).toThrow('Embedded ZIP data is empty');
    expect(input.isConnected).toBe(false);
  });
});

describe('EmbeddedDataIndex', () => {
  it('shows an error when embedded data cannot be loaded', async () => {
    appendEmbeddedZip('');

    render(
      <MemoryRouter>
        <EmbeddedDataIndex />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Unable to load embedded data' })).toBeVisible();
    expect(screen.getByText('Embedded ZIP data is empty')).toBeVisible();
  });
});
