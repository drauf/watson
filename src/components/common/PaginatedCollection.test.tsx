import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import type { JSX } from 'react';
import CollapsableGroup from '../CollapsableGroup';
import PaginatedCollection from './PaginatedCollection';

const items = Array.from({ length: 45 }, (_, index) => index + 1);

const renderItem = (item: number): JSX.Element => <div data-testid={`item-${item}`}>{item}</div>;

const renderCollection = (resetKey = 'initial') => render(
  <PaginatedCollection
    items={items}
    resetKey={resetKey}
    getKey={(item) => item}
    renderItem={renderItem}
  />,
);

test('renders the first twenty items', () => {
  renderCollection();

  expect(screen.getByTestId('item-1')).toBeInTheDocument();
  expect(screen.getByTestId('item-20')).toBeInTheDocument();
  expect(screen.queryByTestId('item-21')).not.toBeInTheDocument();
  expect(screen.getByText('Showing 1-20 of 45')).toBeInTheDocument();
});

test('navigates between pages', () => {
  renderCollection();

  fireEvent.click(screen.getByTestId('paginated-collection-pages--right-navigator'));

  expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
  expect(screen.getByTestId('item-21')).toBeInTheDocument();
  expect(screen.getByTestId('item-40')).toBeInTheDocument();
  expect(screen.getByText('Showing 21-40 of 45')).toBeInTheDocument();
});

test('resets to the first page when the result key changes', () => {
  const { rerender } = renderCollection();
  fireEvent.click(screen.getByTestId('paginated-collection-pages--right-navigator'));

  rerender(
    <PaginatedCollection
      items={items}
      resetKey="filtered"
      getKey={(item) => item}
      renderItem={renderItem}
    />,
  );

  expect(screen.getByTestId('item-1')).toBeInTheDocument();
  expect(screen.queryByTestId('item-21')).not.toBeInTheDocument();
});

test('shows collapse controls for a single group', () => {
  render(
    <PaginatedCollection
      items={[1]}
      resetKey="single"
      getKey={(item) => item}
      renderItem={renderItem}
    />,
  );

  expect(screen.getByRole('button', { name: 'Expand all' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Collapse all' })).toBeInTheDocument();
});

test('reapplies Expand all after an individual group is collapsed', () => {
  render(
    <PaginatedCollection
      items={[1]}
      resetKey="groups"
      getKey={(item) => item}
      renderItem={(item) => (
        <CollapsableGroup
          header={(
            <span>
              Group
              {item}
            </span>
          )}
          content={(
            <span>
              Details
              {item}
            </span>
          )}
        />
      )}
    />,
  );

  const groupToggle = screen.getByRole('button', { name: 'Group1' });
  fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
  expect(screen.getByText('Details1')).toBeInTheDocument();

  fireEvent.click(groupToggle);
  expect(screen.queryByText('Details1')).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
  expect(screen.getByText('Details1')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
  expect(screen.queryByText('Details1')).not.toBeInTheDocument();
});
