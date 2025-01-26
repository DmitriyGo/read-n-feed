'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { Skeleton } from './skeleton';

import { cn } from '@/lib';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string | null;
    alt?: string;
    fallback?: React.ReactNode;
  }
>(({ className, src, alt, fallback, ...props }, ref) => (
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
    />

    <AvatarPrimitive.Fallback className="flex size-full items-center justify-center rounded-full bg-secondary">
      {fallback ?? <Skeleton className="size-full" />}
    </AvatarPrimitive.Fallback>
  </AvatarPrimitive.Root>
));

export { Avatar };
