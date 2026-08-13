import { fireEvent, screen } from '@testing-library/react';

// Changing then blurring flushes the debounced regex filter immediately, see RegexFilters
const applyRegexFilter = (label: 'Thread name pattern' | 'Stack trace pattern', value: string): void => {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

export default applyRegexFilter;
