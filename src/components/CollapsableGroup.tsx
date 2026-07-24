import React from 'react';
import './CollapsableGroup.css';

interface Props {
  header: JSX.Element;
  content: JSX.Element[] | JSX.Element;
}

interface State {
  collapse: boolean;
}

export default class CollapsableGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collapse: false };
  }

  private toggleCollapse = () => {
    this.setState((prevState) => ({ collapse: !prevState.collapse }));
  };

  public override render(): JSX.Element {
    const { header, content } = this.props;
    const { collapse } = this.state;

    return (
      <section className="collapsable-group">
        <h5 className="collapsable-group-heading">
          <button
            type="button"
            className="collapsable-group-toggle ellipsis"
            aria-expanded={!collapse}
            onClick={this.toggleCollapse}
          >
            <span className={collapse ? 'chevron rotate' : 'chevron'} />
            {header}
          </button>
        </h5>

        {!collapse && <div className="collapsable-group-content">{content}</div>}
      </section>
    );
  }
}
