import React from 'react';

interface CollapsableGroupControl {
  collapse: boolean;
  version: number;
}

const CollapsableGroupControlContext = React.createContext<CollapsableGroupControl>({
  collapse: true,
  version: 0,
});

export default CollapsableGroupControlContext;
