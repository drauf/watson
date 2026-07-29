import React from 'react';
import CollapsableGroupControlContext from './CollapsableGroupControlContext';

interface Props {
  collapse: boolean;
  version: number;
  children: React.ReactNode;
}

const CollapsableGroupControlProvider = ({
  collapse,
  version,
  children,
}: Props): JSX.Element => {
  const value = React.useMemo(() => ({ collapse, version }), [collapse, version]);

  return (
    <CollapsableGroupControlContext.Provider value={value}>
      {children}
    </CollapsableGroupControlContext.Provider>
  );
};

export default CollapsableGroupControlProvider;
