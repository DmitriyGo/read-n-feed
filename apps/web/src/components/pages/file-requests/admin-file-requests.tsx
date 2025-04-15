import { BookRequestStatus } from '@read-n-feed/domain';
import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FileRequestItem } from './file-request-item';

import { Pagination, PerPage } from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useAdminFileRequests } from '@/hooks';
import { useFilterStore, useModalStore } from '@/store';

export const AdminFileRequestsBlock = () => {
  const { setMode } = useModalStore();

  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFilter } = useFilterStore();
  const [urlSearchParams] = useSearchParams();

  const { data } = useAdminFileRequests({
    page: currentPage,
    limit: perPage,
    status: getFilter(urlSearchParams, 'status') as BookRequestStatus,
    bookId: getFilter(urlSearchParams, 'bookId'),
  });

  const myRequests = data?.data;

  const handleCreateRequest = () => {
    setMode('CreateBookRequest');
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h2 className="text-2xl">User file requests</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full text-base" onClick={handleCreateRequest}>
            Create a New Request
          </Button>

          <div className="2xl:grid grid-cols-2 flex flex-col w-full gap-4">
            {isDefined(myRequests) ? (
              myRequests.items.map((requestItem) => (
                <FileRequestItem
                  key={requestItem.id}
                  fileRequest={requestItem}
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
        maxPages={myRequests?.totalPages || 1}
        onPerPageChange={setPerPage}
        perPage={perPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
