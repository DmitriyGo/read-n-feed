import { isDefined } from '@read-n-feed/shared';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['translation', 'validation', 'badges']);

  const Slot = as ?? 'span';

  return (
    <div
      className={cn(
        'text-inherit justify-start flex flex-col lg:flex-row',
        className,
      )}
    >
      {isDefined(label) && (
        <Slot className="w-fit lg:text-nowrap">{label}:&nbsp;</Slot>
      )}
      {isDefined(content) && isLoading !== true ? (
        <Slot className="text-gray-400 text-wrap truncate w-full">
          {content}
        </Slot>
      ) : content === null && isLoading !== true ? (
        <Slot className="text-gray-400">{t('notGiven')}</Slot>
      ) : (
        <Skeleton className="min-h-full min-w-20" />
      )}
    </div>
  );
};
