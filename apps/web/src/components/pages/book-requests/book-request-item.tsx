import { BookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { format } from 'date-fns';
import { Check, FileEdit, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { Route } from '@/constants';
import {
  useBookRequestFilesById,
  useHasRole,
  useVerifyBookRequest,
} from '@/hooks';
import { useModalStore } from '@/store';

const formatDate = (date?: Date | null) => {
  return date ? format(new Date(date), 'MMM d, yyyy') : '';
};

export const BookRequestItem = ({
  bookRequest,
}: {
  bookRequest: BookRequestResponseDto;
}) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const { setMode, setParam } = useModalStore();

  const { hasRole: isAdmin } = useHasRole('ADMIN');
  const isOnAdminPage = pathname.includes('admin');

  const { mutate } = useVerifyBookRequest();

  const { data } = useBookRequestFilesById(bookRequest.id);
  const bookRequestFiles = data?.data;

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
  const navigate = useNavigate();

  const handleClick = (fileId: string) => {
    navigate(Route.Book.Read(bookRequest.id, fileId, 'book'));
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
            {t(bookRequest.status.toLowerCase())}
          </Badge>

          {bookRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleEdit}>
              <FileEdit />
            </Button>
          )}

          {/* Show the verify button only for admins on admin routes when the request is pending */}
          {isAdmin && isOnAdminPage && bookRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleVerify}>
              <Check />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <BookCover book={bookRequest} />

        <div>
          <Description text={bookRequest?.description} />

          <Badges label={t('tags')} tags={bookRequest?.tagLabels} />
          <Badges label={t('genres')} tags={bookRequest?.genreNames} />

          <PartiallyLoadedContent
            label={t('authors')}
            content={bookRequest?.authorNames?.join(', ')}
          />
          <PartiallyLoadedContent
            label={t('publisher')}
            content={bookRequest?.publisher}
          />
          <PartiallyLoadedContent
            label={t('publicationDate')}
            content={
              bookRequest?.publicationDate
                ? formatDate(bookRequest.publicationDate)
                : ''
            }
          />
        </div>

        <div className="border-l pl-4">
          <h3 className="font-medium">{t('requestDetails')}</h3>

          <PartiallyLoadedContent
            label={t('requestedOn')}
            content={formatDate(bookRequest?.createdAt)}
          />
          <PartiallyLoadedContent
            label={t('lastUpdated')}
            content={formatDate(bookRequest?.updatedAt)}
          />

          {bookRequest.status === 'APPROVED' && (
            <PartiallyLoadedContent
              label={t('approvedOn')}
              content={formatDate(bookRequest?.approvedAt)}
            />
          )}

          {bookRequest.status === 'REJECTED' && (
            <>
              <PartiallyLoadedContent
                label={t('rejectedOn')}
                content={formatDate(bookRequest?.rejectedAt)}
              />
              <PartiallyLoadedContent
                label={t('rejectionReason')}
                content={bookRequest?.rejectionReason}
                className="text-red-500"
              />
            </>
          )}

          {bookRequest.adminNotes && (
            <PartiallyLoadedContent
              label={t('adminNotes')}
              content={bookRequest?.adminNotes}
              className="text-blue-500"
            />
          )}

          <div className="border-l pl-4">
            {bookRequestFiles?.map((bookFile) => (
              <div
                key={bookFile.id}
                onClick={() => handleClick(bookFile.id)}
                className="border p-2 flex flex-row [&>*]:w-full cursor-pointer hover:scale-[1.01] duration-100 transition-all"
              >
                <p>
                  {t('fileName')}:&nbsp;
                  {isDefined(bookFile.metadata) && 'Title' in bookFile.metadata
                    ? bookFile.metadata['Title']
                    : bookFile.filename}
                </p>

                <p className="text-center">
                  <span>
                    {t('format')}: {bookFile.format}
                  </span>
                </p>

                <div className="flex justify-end">
                  <a href={bookFile.downloadUrl}>
                    <Link2 />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
