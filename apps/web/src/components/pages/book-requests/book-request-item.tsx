import { BookRequestResponseDto } from '@read-n-feed/application';
import { format } from 'date-fns';
import { Check, FileEdit } from 'lucide-react';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useHasRole, useVerifyBookRequest } from '@/hooks';
import { useModalStore } from '@/store';

const formatDate = (date?: Date | null) => {
  return date ? format(new Date(date), 'MMM d, yyyy') : '';
};

export const BookRequestItem = ({
  bookRequest,
}: {
  bookRequest: BookRequestResponseDto;
}) => {
  const { setMode, setParam } = useModalStore();

  const { hasRole: isAdmin } = useHasRole('ADMIN');

  const { mutate } = useVerifyBookRequest();

  const handleEdit = () => {
    setMode('UpdateBookRequest');
    setParam('requestId', bookRequest.id);
  };

  const handleVerify = () => {
    mutate({
      requestId: bookRequest.id,
      body: {
        status: 'APPROVED',
      },
    });
  };

  return (
    <Card className="w-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <PartiallyLoadedContent
          as="h2"
          className="!text-2xl font-semibold [&>*]:!text-white"
          content={bookRequest?.title}
        />

        <div className="gap-4 items-center flex justify-center">
          <Badge
            variant={
              bookRequest.status === 'APPROVED'
                ? 'default'
                : bookRequest.status === 'PENDING'
                  ? 'outline'
                  : 'destructive'
            }
          >
            {bookRequest.status}
          </Badge>

          <Button variant="outline" onClick={handleEdit}>
            <FileEdit />
          </Button>

          {isAdmin && (
            <Button variant="outline" onClick={handleVerify}>
              <Check />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex lg:flex-row flex-col gap-4">
        <BookCover book={bookRequest} />

        <div>
          <Description text={bookRequest?.description} />

          <Badges label="Tags" tags={bookRequest?.tagLabels} />
          <Badges label="Genres" tags={bookRequest?.genreNames} />

          <PartiallyLoadedContent
            label="Authors"
            content={bookRequest?.authorNames?.join(', ')}
          />
          <PartiallyLoadedContent
            label="Publisher"
            content={bookRequest?.publisher}
          />
          <PartiallyLoadedContent
            label="Publication Date"
            content={
              bookRequest?.publicationDate
                ? formatDate(bookRequest.publicationDate)
                : ''
            }
          />
        </div>

        <div className="border-l pl-4">
          <h3 className="font-medium">Request Details</h3>

          <PartiallyLoadedContent
            label="Requested on"
            content={formatDate(bookRequest?.createdAt)}
          />
          <PartiallyLoadedContent
            label="Last Updated"
            content={formatDate(bookRequest?.updatedAt)}
          />

          {bookRequest.status === 'APPROVED' && (
            <PartiallyLoadedContent
              label="Approved on"
              content={formatDate(bookRequest?.approvedAt)}
            />
          )}

          {bookRequest.status === 'REJECTED' && (
            <>
              <PartiallyLoadedContent
                label="Rejected on"
                content={formatDate(bookRequest?.rejectedAt)}
              />
              <PartiallyLoadedContent
                label="Rejection Reason"
                content={bookRequest?.rejectionReason}
                className="text-red-500"
              />
            </>
          )}

          {bookRequest.adminNotes && (
            <PartiallyLoadedContent
              label="Admin Notes"
              content={bookRequest?.adminNotes}
              className="text-blue-500"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
