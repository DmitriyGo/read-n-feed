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
        <p className="text-gray-400">{content}</p>
      ) : content === null && isLoading !== true ? (
        <p className="text-gray-400">Not Given</p>
      ) : (
        <Skeleton className="min-h-full min-w-20" />
      )}
    </div>
  );
};
