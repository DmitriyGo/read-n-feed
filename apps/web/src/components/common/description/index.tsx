import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Skeleton } from '@/components/ui';

export const Description = ({
  text,
  length = 300,
}: {
  text?: string | null;
  length?: number;
}) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const [showMore, setShowMore] = useState(false);

  const indexOfPreviousSpace = Math.max(
    text?.lastIndexOf(' ', length) ?? 0,
    length,
  );

  return isDefined(text) ? (
    <p className="text-justify">
      <span>
        {t('description')}:{' '}
        {showMore ? text : text.slice(0, indexOfPreviousSpace)}
      </span>

      {text.length > length && (
        <span
          className="!text-blue-500 cursor-pointer"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? (
            <>
              <br />
              {t('showLess')}
            </>
          ) : (
            '...'
          )}
        </span>
      )}
    </p>
  ) : (
    <Skeleton className="h-[24px]" />
  );
};
