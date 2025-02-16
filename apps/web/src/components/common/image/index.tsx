import { isDefined } from '@read-n-feed/shared';
import { HTMLProps } from 'react';

import { Conditional } from '../conditional';

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
}: Omit<HTMLProps<HTMLImageElement>, 'classID'> &
  ({ size?: number } | { width?: number; height?: number })) => {
  const calculatedWidth = size ? `${size}px` : width ? `${width}px` : 'auto';
  const calculatedHeight = size ? `${size}px` : height ? `${height}px` : 'auto';

  return (
    <Conditional condition={isDefined(src)}>
      <Conditional.True>
        <img
          style={{
            width: calculatedWidth,
            height: calculatedHeight,
          }}
          className={cn('rounded-lg')}
          src={src}
          alt={alt ?? ''}
          {...props}
        />
      </Conditional.True>

      <Conditional.False>
        <Skeleton
          style={{
            width: calculatedWidth,
            height: calculatedHeight,
          }}
        />
      </Conditional.False>
    </Conditional>
  );
};
