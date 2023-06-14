import React from 'react';
import ReactDOM from 'react-dom';
import Thread from '../../types/Thread';
import ThreadDetailsWindow from './ThreadDetailsWindow';

type Props = {
  text: string;
  className: string;
  thread: Thread;
};

const copyStyles = (sourceDoc: Document, targetDoc: Document): void => {
  Array.from(sourceDoc.styleSheets).forEach((sheet) => {
    const styleSheet = sheet;

    if (styleSheet.cssRules) { // for <style> elements
      const newStyleEl = sourceDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach((cssRule) => {
        newStyleEl.appendChild(sourceDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) { // for <link> elements
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
};

export default class ThreadDetails extends React.PureComponent<Props> {
  private readonly windows: Set<Window> = new Set();

  public componentWillUnmount() {
    for (const window of this.windows) {
      window.close();
    }
  }

  private openNewWindow = () => {
    const { thread } = this.props;
    const newWindow = window.open('', '', 'width=960,height=700,titlebar=0,menubar=0,location=0,toolbar=0,status=0');
    if (newWindow) {
      this.windows.add(newWindow);
      newWindow.document.title = thread.name;
      ReactDOM.render(<ThreadDetailsWindow thread={thread} />, newWindow.document.body);
      copyStyles(document, newWindow.document);

      newWindow.addEventListener('beforeunload', () => {
        ReactDOM.unmountComponentAtNode(newWindow.document.body);
        this.windows.delete(newWindow);
      });
    }
  };

  public handleClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    this.openNewWindow();
  };

  public render(): JSX.Element {
    const { text, className } = this.props;

    return (
      <button type="button" className={className} onClick={this.handleClick}>{text}</button>
    );
  }
}
