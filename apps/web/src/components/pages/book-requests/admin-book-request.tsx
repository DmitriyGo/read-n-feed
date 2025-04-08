import { BookRequestStatus } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BookRequestItem } from './book-request-item';

import { Pagination, PerPage } from '@/components/common';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { useAdminBookRequests } from '@/hooks';
import { useFilterStore } from '@/store';

export const AdminBookRequestsBlock = () => {
  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFilter } = useFilterStore();
  const [urlSearchParams] = useSearchParams();

  const { data } = useAdminBookRequests({
    limit: perPage,
    page: currentPage,
    status: getFilter(urlSearchParams, 'status') as BookRequestStatus,
    title: getFilter(urlSearchParams, 'title'),
  });

  const bookRequests = data?.data;

  return (
    <div>
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Your book requests</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="2xl:grid grid-cols-2 flex flex-col w-full gap-4">
            {isDefined(bookRequests) ? (
              bookRequests.items.map((requestItem) => (
                <BookRequestItem
                  key={requestItem.id}
                  bookRequest={requestItem}
                />
              ))
            ) : (
              <div>No requests</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        maxPages={bookRequests?.totalPages || 1}
        onPerPageChange={setPerPage}
        perPage={perPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
