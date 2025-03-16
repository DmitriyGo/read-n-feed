import { isDefined } from '@read-n-feed/shared';

import { BookRequestItem } from './book-request-item';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useMyBookRequests } from '@/hooks/read/book-requests';
import { useModalStore } from '@/store';

export const MyBookRequestsBlock = () => {
  const { data } = useMyBookRequests();

  const { setMode } = useModalStore();

  // const [perPage, setPerPage] = useState<PerPage>(10);
  // const [currentPage, setCurrentPage] = useState(1);

  const myRequests = data?.data;

  const handleCreateRequest = () => {
    setMode('CreateRequestForUpload');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-2xl">Your book requests</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full text-base" onClick={handleCreateRequest}>
            Create a New Request
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
              <div>No requests</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <Pagination
        currentPage={currentPage}
        maxPages={myRequests?.totalPages || 1}
        onPerPageChange={setPerPage}
        perPage={perPage}
        setCurrentPage={setCurrentPage}
      /> */}
    </>
  );
};
