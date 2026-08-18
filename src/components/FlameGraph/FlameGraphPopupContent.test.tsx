import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FlameGraphPopupContent from './FlameGraphPopupContent';
import { FlameGraphNode } from './flameGraphModel';

const node: FlameGraphNode = {
  name: 'native frame',
  value: 3,
  children: [],
  fade: false,
  parsedStackFrame: {
    rawFrame: 'native frame',
    rawClassName: '',
    cleanClassName: '',
    rawMethodName: '',
    cleanMethodName: '',
    packageName: '',
    line: 'native frame',
  },
};

describe('FlameGraphPopupContent', () => {
  it('omits unavailable stack frame metadata', () => {
    render(<FlameGraphPopupContent node={node} totalSamples={3} />);

    expect(screen.getByText('3 (100.00%)')).toBeVisible();
    expect(screen.queryByText('Package')).not.toBeInTheDocument();
    expect(screen.queryByText('Class')).not.toBeInTheDocument();
    expect(screen.queryByText('Method')).not.toBeInTheDocument();
    expect(screen.getByText('native frame')).toBeVisible();
  });
});
