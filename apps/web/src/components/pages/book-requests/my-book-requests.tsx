import { isDefined } from '@read-n-feed/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { BookRequestItem } from './book-request-item';

import { Pagination, PerPage } from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { AcceptedStatus } from '@/constants';
import { useMyBookRequests } from '@/hooks';
import { useFilterStore, useModalStore } from '@/store';

export const MyBookRequestsBlock = () => {
  const { t } = useTranslation();
  const { setMode } = useModalStore();

  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFilter } = useFilterStore();
  const [urlSearchParams] = useSearchParams();

  const { data } = useMyBookRequests({
    page: currentPage,
    limit: perPage,
    status: getFilter(urlSearchParams, 'status') as AcceptedStatus,
  });

  const myRequests = data?.data;

  const handleCreateRequest = () => {
    setMode('CreateBookRequest');
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <h2 className="text-2xl">{t('yourBookRequests')}</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full text-base" onClick={handleCreateRequest}>
            {t('createNewRequest')}
          </Button>

          <div className="2xl:grid grid-cols-2 flex flex-col w-full gap-4">
            {isDefined(myRequests) ? (
              myRequests.items.map((requestItem) => (
                <BookRequestItem
                  key={requestItem.id}
                  bookRequest={requestItem}
                />
              ))
            ) : (
              <div>{t('noRequests')}</div>
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
