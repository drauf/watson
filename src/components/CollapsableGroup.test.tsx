import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import CollapsableGroup from './CollapsableGroup';

const renderGroup = () => render(
  <CollapsableGroup
    header={<span>Example group</span>}
    content={<p>Group details</p>}
  />,
);

test('starts collapsed', () => {
  renderGroup();

  expect(screen.getByRole('button', { name: 'Example group' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Group details')).not.toBeInTheDocument();
});

test('toggles group details', () => {
  renderGroup();

  const toggle = screen.getByRole('button', { name: 'Example group' });
  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Group details')).toBeInTheDocument();

  fireEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Group details')).not.toBeInTheDocument();
});
