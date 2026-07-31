import EmptyStateComponent from '@atlaskit/empty-state';

import type { JSX } from 'react';

const DEFAULT_TITLE = 'No threads match the selected criteria.';
const DEFAULT_DESCRIPTION = 'Adjust the filters and try again.';

export interface EmptyStateContent {
  title?: string;
  description?: string;
}

interface Props extends EmptyStateContent {
  fullPage?: boolean;
}

const EmptyState = ({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, fullPage = false }: Props): JSX.Element => {
  const content = (
    <EmptyStateComponent
      header={title}
      description={description}
    />
  );

  return fullPage ? <main id="centered">{content}</main> : content;
};

EmptyState.defaultProps = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  fullPage: false,
};

export default EmptyState;
