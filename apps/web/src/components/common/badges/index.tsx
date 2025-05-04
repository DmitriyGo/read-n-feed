import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Badge, Skeleton } from '@/components/ui';

export const Badges = ({
  maxLength = 5,
  tags,
  label,
}: {
  label?: string;
  tags: string[] | undefined | null;
  maxLength?: number;
}) => {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {isDefined(label) && <p>{label}:</p>}

      {isDefined(tags) ? (
        <>
          {tags.slice(0, showMore ? tags.length : maxLength).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}

          {tags.length > maxLength && (
            <span
              className="!text-blue-500 cursor-pointer"
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? <>{t('showLess')}</> : '...'}
            </span>
          )}
        </>
      ) : (
        <Skeleton className="h-[22px] w-32" />
      )}
    </div>
  );
};
