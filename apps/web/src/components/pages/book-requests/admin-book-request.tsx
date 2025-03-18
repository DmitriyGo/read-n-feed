import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';

import { BookRequestItem } from './book-request-item';

import { Pagination, PerPage } from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useAdminBookRequests } from '@/hooks';
import { useModalStore } from '@/store';

export const AdminBookRequestsBlock = () => {
  const { setMode } = useModalStore();

  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useAdminBookRequests({
    limit: perPage,
    page: currentPage,
  });

  const bookRequests = data?.data;

  return (
    <>
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
    </>
  );
};
