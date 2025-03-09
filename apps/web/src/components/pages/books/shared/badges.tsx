import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';

import { Conditional } from '@/components/common';
import { Badge, Skeleton } from '@/components/ui';

export const Badges = ({
  maxLength = 5,
  tags,
  label,
}: {
  label?: string;
  tags?: string[];
  maxLength?: number;
}) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {isDefined(label) && <p>{label}</p>}

      <Conditional condition={isDefined(tags)}>
        <Conditional.True>
          {isDefined(tags) &&
            tags
              .slice(0, showMore ? tags.length : maxLength)
              .map((tag) => <Badge>{tag}</Badge>)}

          {isDefined(tags) && tags.length > maxLength && (
            <span
              className="!text-blue-500 cursor-pointer"
              onClick={() => setShowMore((prev) => !prev)}
            >
              {showMore ? <>Show less</> : '...'}
            </span>
          )}
        </Conditional.True>

        <Conditional.False>
          <Skeleton className="h-[22px] w-32" />
        </Conditional.False>
      </Conditional>
    </div>
  );
};
