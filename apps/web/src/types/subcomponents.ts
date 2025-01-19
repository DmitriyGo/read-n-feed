import React, { ReactNode, JSXElementConstructor, FC } from 'react';

type ComponentWithDisplayName<TNames> = JSXElementConstructor<unknown> & {
  displayName: TNames;
};

export type FCWithNames<TNames, TProps> = FC<TProps> & {
  displayName: TNames;
};

const isComponentWithDisplayName = <TNames>(
  type: string | JSXElementConstructor<unknown>,
): type is ComponentWithDisplayName<TNames> => {
  return typeof type !== 'string' && 'displayName' in type;
};

export const getChildrenOnDisplayName = <TNames>(
  children: ReactNode,
  displayName: TNames,
) =>
  React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      isComponentWithDisplayName(child.type) &&
      child.type.displayName === displayName
    ) {
      return child as ReactNode;
    }
  });
