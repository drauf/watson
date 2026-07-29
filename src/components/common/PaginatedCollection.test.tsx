import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import PaginatedCollection from './PaginatedCollection';

const items = Array.from({ length: 45 }, (_, index) => index + 1);

const renderCollection = (resetKey = 'initial') => render(
  <PaginatedCollection
    items={items}
    resetKey={resetKey}
    getKey={(item) => item}
    renderItem={(item) => <div>{item}</div>}
  />,
);

test('renders the first twenty items', () => {
  renderCollection();

  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.getByText('20')).toBeInTheDocument();
  expect(screen.queryByText('21')).not.toBeInTheDocument();
  expect(screen.getByText('Showing 1-20 of 45')).toBeInTheDocument();
});

test('navigates between pages', () => {
  renderCollection();

  fireEvent.click(screen.getByTestId('paginated-collection-pages--right-navigator'));

  expect(screen.queryByText('1')).not.toBeInTheDocument();
  expect(screen.getByText('21')).toBeInTheDocument();
  expect(screen.getByText('40')).toBeInTheDocument();
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
      renderItem={(item) => <div>{item}</div>}
    />,
  );

  expect(screen.getByText('1')).toBeInTheDocument();
  expect(screen.queryByText('21')).not.toBeInTheDocument();
});
