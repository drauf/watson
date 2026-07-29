import React from 'react';
import './CollapsableGroup.css';
import './common/ExpandableSurface.css';

interface Props {
  header: JSX.Element;
  content: JSX.Element[] | JSX.Element;
  initiallyCollapsed: boolean;
}

interface State {
  collapse: boolean;
}

export default class CollapsableGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collapse: props.initiallyCollapsed };
  }

  private toggleCollapse = () => {
    this.setState((prevState) => ({ collapse: !prevState.collapse }));
  };

  public override render(): JSX.Element {
    const { header, content } = this.props;
    const { collapse } = this.state;

    return (
      <section
        className={`collapsable-group expandable-surface${collapse ? '' : ' expandable-surface-expanded'}`}
      >
        <h5 className="collapsable-group-heading">
          <button
            type="button"
            className="expandable-surface-toggle ellipsis"
            aria-expanded={!collapse}
            onClick={this.toggleCollapse}
          >
            <span className={collapse ? 'chevron rotate' : 'chevron'} />
            {header}
          </button>
        </h5>

        {!collapse && <div className="expandable-surface-content">{content}</div>}
      </section>
    );
  }
}
