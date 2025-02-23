import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';

import { Skeleton } from '@/components/ui';

export const Description = ({
  text,
  length = 300,
}: {
  text?: string | null;
  length?: number;
}) => {
  const [showMore, setShowMore] = useState(false);

  const indexOfPreviousSpace = text?.lastIndexOf(' ', length);

  return isDefined(text) ? (
    <p className="text-justify">
      <span>{showMore ? text : text.slice(0, indexOfPreviousSpace)}</span>

      {text.length > length && (
        <span
          className="!text-blue-500 cursor-pointer"
          onClick={() => setShowMore((prev) => !prev)}
        >
          {showMore ? (
            <>
              <br />
              Show less
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
