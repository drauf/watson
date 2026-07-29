import Pagination from '@atlaskit/pagination';
import React from 'react';
import './PaginatedCollection.css';

const PAGE_SIZE = 20;

interface Props<Item> {
  items: Item[];
  resetKey: string;
  getKey: (item: Item) => React.Key;
  renderItem: (item: Item) => JSX.Element;
}

interface State {
  page: number;
}

export default class PaginatedCollection<Item> extends React.PureComponent<Props<Item>, State> {
  constructor(props: Props<Item>) {
    super(props);
    this.state = { page: 0 };
  }

  public override componentDidUpdate(previousProps: Props<Item>): void {
    const { items, resetKey } = this.props;
    const { page } = this.state;
    const lastPage = Math.max(Math.ceil(items.length / PAGE_SIZE) - 1, 0);

    if (previousProps.resetKey !== resetKey && page !== 0) {
      this.setState({ page: 0 });
    } else if (page > lastPage) {
      this.setState({ page: lastPage });
    }
  }

  private changePage = (_event: React.SyntheticEvent, selectedPage: number) => {
    this.setState({ page: selectedPage - 1 });
  };

  public override render(): JSX.Element {
    const { items, getKey, renderItem } = this.props;
    const { page } = this.state;
    const pageCount = Math.ceil(items.length / PAGE_SIZE);
    const firstItemIndex = page * PAGE_SIZE;
    const currentItems = items.slice(firstItemIndex, firstItemIndex + PAGE_SIZE);

    return (
      <>
        {currentItems.map((item) => React.cloneElement(renderItem(item), { key: getKey(item) }))}

        {pageCount > 1 && (
          <nav className="paginated-collection" aria-label="Pagination">
            <span>
              Showing
              {' '}
              {firstItemIndex + 1}
              -
              {Math.min(firstItemIndex + PAGE_SIZE, items.length)}
              {' of '}
              {items.length}
            </span>
            <Pagination
              pages={Array.from({ length: pageCount }, (_value, index) => index + 1)}
              selectedIndex={page}
              onChange={this.changePage}
              testId="paginated-collection-pages"
            />
          </nav>
        )}
      </>
    );
  }
}
