import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { FileRequestItem } from './file-request-item';

import { Pagination, PerPage } from '@/components/common';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { AcceptedStatus } from '@/constants';
import { useMyFileRequests } from '@/hooks';
import { useFilterStore } from '@/store';

export const MyFileRequestsBlock = () => {
  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFilter } = useFilterStore();
  const [urlSearchParams] = useSearchParams();

  const { data } = useMyFileRequests({
    page: currentPage,
    limit: perPage,
    status: getFilter(urlSearchParams, 'status') as AcceptedStatus,
  });

  const myRequests = data?.data;

  return (
    <div>
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Your file requests</h2>
        </CardHeader>

        <CardContent className="space-y-4">
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
