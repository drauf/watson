import ChevronDownIcon from '@atlaskit/icon/core/chevron-down';
import React, { type JSX } from 'react';
import './CollapsableGroup.css';
import CollapsableGroupControlContext from './CollapsableGroupControlContext';

interface Props {
  header: JSX.Element;
  content: JSX.Element[] | JSX.Element;
}

interface State {
  collapse: boolean;
  controlVersion: number;
}

class CollapsableGroup extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { collapse: true, controlVersion: 0 };
  }

  public override componentDidMount(): void {
    this.applyCollapseControl();
  }

  public override componentDidUpdate(): void {
    this.applyCollapseControl();
  }

  private applyCollapseControl = (): void => {
    const { collapse, version } = this.context as React.ContextType<typeof CollapsableGroupControlContext>;
    const { controlVersion } = this.state;
    if (controlVersion !== version) {
      this.setState({ collapse, controlVersion: version });
    }
  };

  private toggleCollapse = () => {
    this.setState((previousState) => ({ collapse: !previousState.collapse }));
  };

  public override render(): JSX.Element {
    const { header, content } = this.props;
    const { collapse } = this.state;

    return (
      <section
        className={`collapsable-group${collapse ? '' : ' collapsable-group-expanded'}`}
      >
        <h5 className="collapsable-group-heading">
          <button
            type="button"
            className="collapsable-group-toggle"
            aria-expanded={!collapse}
            onClick={this.toggleCollapse}
          >
            <span className={collapse ? 'collapsable-group-chevron collapsable-group-chevron-collapsed' : 'collapsable-group-chevron'}>
              <ChevronDownIcon label="" size="small" />
            </span>
            {header}
          </button>
        </h5>

        {!collapse && <div className="collapsable-group-content">{content}</div>}
      </section>
    );
  }
}

CollapsableGroup.contextType = CollapsableGroupControlContext;

export default CollapsableGroup;
