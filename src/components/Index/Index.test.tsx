import { render, screen } from '@testing-library/react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import Index from './Index';

vi.mock('../EmbeddedDataIndex/EmbeddedDataIndex', () => ({
  default: () => <div>Embedded data</div>,
}));

vi.mock('../FullPageDropzone/FullPageDropzone', () => ({
  default: () => <div>Dropzone</div>,
}));

const appendEmbeddedZip = (value: string): void => {
  const input = document.createElement('input');
  input.id = 'embedded-file-input';
  input.setAttribute('value', value);
  document.body.append(input);
};

describe('Index', () => {
  afterEach(() => {
    document.getElementById('embedded-file-input')?.remove();
  });

  it('shows the dropzone when no embedded ZIP is available', () => {
    render(<Index />);

    expect(screen.getByText('Dropzone')).toBeInTheDocument();
  });

  it('shows embedded data mode when a static ZIP value is available', () => {
    appendEmbeddedZip('embedded-data');

    render(<Index />);

    expect(screen.getByText('Embedded data')).toBeInTheDocument();
  });
});
