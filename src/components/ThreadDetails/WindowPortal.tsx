import React from 'react';
import ReactDOM from 'react-dom';

type Props = {
  windowTitle: string;
  className: string;
  onUnload: () => void;
};

export default class WindowPortal extends React.PureComponent<Props> {
  private static windows: Array<Window> = [];

  public static copyStyles = (sourceDoc: Document, targetDoc: Document): void => {
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

  private static closeAllExternalWindows = (): void => {
    WindowPortal.windows
      .filter((external) => !external.closed)
      .forEach((external) => external.close());
  };

  private readonly windowFeatures = 'width=960,height=700,titlebar=0,menubar=0,location=0,toolbar=0,status=0';

  private readonly container: HTMLElement;

  private externalWindow: Window | null;

  constructor(props: Props) {
    super(props);

    this.externalWindow = null;
    this.container = document.createElement('div');

    const { className } = this.props;
    if (className) {
      this.container.className = className;
    }
  }

  public componentDidMount(): void {
    window.onunload = WindowPortal.closeAllExternalWindows;

    this.externalWindow = window.open('', '', this.windowFeatures);
    if (this.externalWindow) {
      const { windowTitle, onUnload } = this.props;
      this.externalWindow.document.title = windowTitle;
      this.externalWindow.document.body.appendChild(this.container);
      this.externalWindow.onunload = onUnload;
      WindowPortal.copyStyles(document, this.externalWindow.document);
      WindowPortal.windows.push(this.externalWindow);
    }
  }

  public componentWillUnmount(): void {
    if (this.externalWindow && !this.externalWindow.closed) {
      this.externalWindow.close();
    }
    WindowPortal.windows = WindowPortal.windows.filter((ext) => ext !== this.externalWindow);
  }

  public render(): JSX.Element {
    const { children } = this.props;
    return ReactDOM.createPortal(children, this.container);
  }
}
