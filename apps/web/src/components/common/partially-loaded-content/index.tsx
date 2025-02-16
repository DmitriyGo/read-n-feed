import { ReactNode } from 'react';

import { Skeleton } from '@/components/ui';
import { cn } from '@/lib';
import { BaseComponentProps } from '@/types';

export const PartiallyLoadedContent = ({
  className,
  content,
  label,
  isLoading,
}: BaseComponentProps<{
  content?: ReactNode | null;
  label: string;
  isLoading?: boolean;
}>) => {
  return (
    <div className={cn('text-inherit justify-start flex flex-row', className)}>
      <p>{label}:&nbsp;</p>
      {content && isLoading !== true ? (
        content
      ) : content === null && isLoading !== true ? (
        'Not Given'
      ) : (
        <Skeleton className="min-h-full min-w-20" />
      )}
    </div>
  );
};
