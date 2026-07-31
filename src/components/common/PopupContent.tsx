import React from 'react';
import './PopupContent.css';

// Shared rich surface for HoverPopup, CursorPopup, and chart popups.
interface PopupContentProps {
  children: React.ReactNode | string;
}

const PopupContent: React.FC<PopupContentProps> = ({ children }) => (
  <div className="popup-content">{children}</div>
);

export default PopupContent;
