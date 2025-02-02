'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useState,
} from 'react';

import { Skeleton } from './skeleton';

import { cn } from '@/lib';

const Avatar = forwardRef<
  ElementRef<typeof AvatarPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string | null;
    alt?: string;
    fallback?: React.ReactNode;
  }
>(({ className, src, alt, fallback, ...props }, ref) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        className={cn('aspect-square size-full', className)}
        src={src ?? undefined}
        alt={alt}
        onLoadingStatusChange={() => setIsLoading(false)}
      />

      <AvatarPrimitive.Fallback
        delayMs={100}
        className="flex size-full items-center justify-center rounded-full bg-secondary"
      >
        {isLoading === true || src === undefined ? (
          <Skeleton className="size-full" />
        ) : (
          (fallback ?? 'NOT GIVEN')
        )}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});

export { Avatar };
