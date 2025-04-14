import { isDefined } from '@read-n-feed/shared';
import { HTMLProps } from 'react';

import { Skeleton } from '@/components/ui';
import { cn } from '@/lib';

export const Image = ({
  src,
  alt,
  width,
  height,
  size,
  className,
  ...props
}: Omit<HTMLProps<HTMLImageElement>, 'classID' | 'src'> & {
  src: string | null | undefined;
} & ({ size?: number } | { width?: number; height?: number })) => {
  const calculatedWidth = size ? `${size}px` : width ? `${width}px` : 'auto';
  const calculatedHeight = size ? `${size}px` : height ? `${height}px` : 'auto';

  return isDefined(src) ? (
    <img
      style={{
        minWidth: calculatedWidth,
        minHeight: calculatedHeight,
        maxWidth: calculatedWidth,
        maxHeight: calculatedHeight,
      }}
      className={cn('rounded-lg', '', className)}
      src={src ?? undefined}
      alt={alt ?? ''}
      {...props}
    />
  ) : (
    <Skeleton
      style={{
        minWidth: calculatedWidth,
        minHeight: calculatedHeight,
        maxWidth: calculatedWidth,
        maxHeight: calculatedHeight,
      }}
    />
  );
};
