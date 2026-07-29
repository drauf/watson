import React from 'react';
import './GroupHeader.css';

interface Props {
  leading: React.ReactNode;
  title: React.ReactNode;
  metadata: React.ReactNode;
}

const GroupHeader = ({ leading, title, metadata }: Props): JSX.Element => (
  <span className="group-header">
    {leading && <span className="group-header-leading">{leading}</span>}
    <span className="group-header-title">{title}</span>
    {metadata && <span className="group-header-metadata">{metadata}</span>}
  </span>
);

export default GroupHeader;
