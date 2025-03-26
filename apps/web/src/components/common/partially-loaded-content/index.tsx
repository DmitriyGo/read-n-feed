import { isDefined } from '@read-n-feed/shared';
import { ReactNode } from 'react';

import { Skeleton } from '@/components/ui';
import { cn } from '@/lib';
import { BaseComponentProps } from '@/types';

export const PartiallyLoadedContent = ({
  className,
  content,
  label,
  isLoading,
  as,
}: BaseComponentProps<{
  content?: ReactNode | null;
  label?: string;
  isLoading?: boolean;
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}>) => {
  const Slot = as ?? 'span';

  return (
    <div className={cn('text-inherit justify-start flex flex-row', className)}>
      {isDefined(label) && <Slot>{label}:&nbsp;</Slot>}
      {content && isLoading !== true ? (
        <Slot className="text-gray-400">{content}</Slot>
      ) : content === null && isLoading !== true ? (
        <Slot className="text-gray-400">Not Given</Slot>
      ) : (
        <Skeleton className="min-h-full min-w-20" />
      )}
    </div>
  );
};
