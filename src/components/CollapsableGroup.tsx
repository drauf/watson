import React from 'react';

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
      <p>
        <button type="button" className="default-color ellipsis" onClick={this.toggleCollapse}>
          <h5>
            <span className={collapse ? 'chevron rotate' : 'chevron'} />
            {header}
          </h5>
        </button>

        {!collapse && content}
      </p>
    );
  }
}
