import { FCWithNames, getChildrenOnDisplayName } from '@/types';

type ConditionalElements = 'True' | 'False';

type ConditionalComponent = {
  children: React.ReactNode;
};

export const Conditional = ({
  children,
  condition,
}: ConditionalComponent & {
  condition: boolean;
}) => {
  const trueChildren = getChildrenOnDisplayName<ConditionalElements>(
    children,
    'True',
  );
  const falseChildren = getChildrenOnDisplayName<ConditionalElements>(
    children,
    'False',
  );

  return condition ? trueChildren : falseChildren;
};

const True: FCWithNames<ConditionalElements, ConditionalComponent> = ({
  children,
}) => {
  return children;
};

True.displayName = 'True';
Conditional.True = True;

const False: FCWithNames<ConditionalElements, ConditionalComponent> = ({
  children,
}) => {
  return children;
};

False.displayName = 'False';
Conditional.False = False;
