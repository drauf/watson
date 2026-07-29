import Button from '@atlaskit/button/new';
import Pagination from '@atlaskit/pagination';
import React from 'react';
import './PaginatedCollection.css';
import CollapsableGroupControlProvider from '../CollapsableGroupControlProvider';

const PAGE_SIZE = 20;

interface Props<Item> {
  items: Item[];
  resetKey: string;
  getKey: (item: Item) => React.Key;
  renderItem: (item: Item) => JSX.Element;
}

interface State {
  page: number;
  collapse: boolean;
  // Changes whenever Expand all or Collapse all is clicked.
  // This lets a repeated click reset groups changed individually.
  collapseVersion: number;
}

export default class PaginatedCollection<Item> extends React.PureComponent<Props<Item>, State> {
  constructor(props: Props<Item>) {
    super(props);
    this.state = { page: 0, collapse: true, collapseVersion: 0 };
  }

  public override componentDidUpdate(previousProps: Props<Item>): void {
    const { items, resetKey } = this.props;
    const { page } = this.state;
    const lastPage = Math.max(Math.ceil(items.length / PAGE_SIZE) - 1, 0);

    if (previousProps.resetKey !== resetKey) {
      this.resetPageAndCollapse();
    } else if (page > lastPage) {
      this.setState((previousState) => ({
        page: lastPage,
        collapse: true,
        collapseVersion: previousState.collapseVersion + 1,
      }));
    }
  }

  private changePage = (_event: React.SyntheticEvent, selectedPage: number) => {
    this.setState((previousState) => ({
      page: selectedPage - 1,
      collapse: true,
      collapseVersion: previousState.collapseVersion + 1,
    }));
  };

  private resetPageAndCollapse = () => {
    this.setState((previousState) => ({
      page: 0,
      collapse: true,
      collapseVersion: previousState.collapseVersion + 1,
    }));
  };

  private setCollapse = (collapse: boolean) => {
    this.setState((previousState) => ({
      collapse,
      collapseVersion: previousState.collapseVersion + 1,
    }));
  };

  public override render(): JSX.Element {
    const { items, getKey, renderItem } = this.props;
    const { page, collapse, collapseVersion } = this.state;
    const pageCount = Math.ceil(items.length / PAGE_SIZE);
    const firstItemIndex = page * PAGE_SIZE;
    const currentItems = items.slice(firstItemIndex, firstItemIndex + PAGE_SIZE);

    return (
      <CollapsableGroupControlProvider collapse={collapse} version={collapseVersion}>
        {currentItems.length > 0 && (
          <div className="paginated-collection-actions">
            <Button appearance="default" spacing="compact" onClick={() => this.setCollapse(false)}>
              Expand all
            </Button>
            <Button appearance="default" spacing="compact" onClick={() => this.setCollapse(true)}>
              Collapse all
            </Button>
          </div>
        )}

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
      </CollapsableGroupControlProvider>
    );
  }
}
