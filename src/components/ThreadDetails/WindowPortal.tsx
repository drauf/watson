import React from 'react';
import ReactDOM from 'react-dom';

type WindowPortalProps = {
  windowTitle: string;
  className: string;
  onUnload: () => void;
};

export default class WindowPortal extends React.PureComponent<WindowPortalProps> {
  private static windows: Array<Window | null> = [];
  private externalWindow: Window | null;
  private container: HTMLElement;

  private windowFeatures =
    'width=960,height=530,titlebar=0,menubar=0,location=0,toolbar=0,status=0';

  constructor(props: WindowPortalProps) {
    super(props);

    this.externalWindow = null;
    this.container = document.createElement('div');
    if (this.props.className) {
      this.container.className = this.props.className;
    }
  }

  public copyStyles(sourceDoc: Document, targetDoc: Document) {
    Array.from(sourceDoc.styleSheets).forEach((sheet) => {
      const styleSheet = sheet as CSSStyleSheet;

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
  }

  public componentDidMount() {
    window.onunload = this.closeAllExternalWindows;

    this.externalWindow = window.open('', '', this.windowFeatures);
    if (this.externalWindow) {
      WindowPortal.windows.push(this.externalWindow);
      this.externalWindow.document.title = this.props.windowTitle;
      this.externalWindow.document.body.appendChild(this.container);
      this.copyStyles(document, this.externalWindow.document);
      this.externalWindow.onunload = this.props.onUnload;
    }
  }

  public componentWillUnmount() {
    if (this.externalWindow && !this.externalWindow.closed) {
      this.externalWindow.close();
    }
    WindowPortal.windows = WindowPortal.windows.filter(ext => ext !== this.externalWindow);
  }

  public render() {
    return ReactDOM.createPortal(this.props.children, this.container);
  }

  private closeAllExternalWindows = () => {
    for (const external of WindowPortal.windows) {
      if (external && !external.closed) {
        external.close();
      }
    }
  }
}
