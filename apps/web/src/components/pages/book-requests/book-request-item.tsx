import { BookRequestResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { FileQuestion, FileEdit, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { Route } from '@/constants';
import { useBookRequestFilesById, useHasRole } from '@/hooks';
import { formatDate } from '@/lib';
import { useModalStore } from '@/store';

export const BookRequestItem = ({
  bookRequest,
}: {
  bookRequest: BookRequestResponseDto;
}) => {
  const { t } = useTranslation(['translation', 'badges']);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { setMode, setParam } = useModalStore();

  const { hasRole: isAdmin } = useHasRole('ADMIN');
  const isOnAdminPage = pathname.includes('admin');

  const { data } = useBookRequestFilesById(bookRequest.id);
  const bookRequestFiles = data?.data;

  const handleEdit = () => {
    setMode('UpdateBookRequest');
    setParam('requestId', bookRequest.id);
  };

  const handleVerify = () => {
    setParam('requestId', bookRequest.id);
    setParam('requestType', 'book');
    setMode('VerifyRequest');
  };

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

        <div className="gap-4 items-center flex max-md:flex-col justify-center">
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
              <FileQuestion />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <BookCover book={bookRequest} />

        <div>
          <Description text={bookRequest?.description} />

          <Badges
            label={t('tags', { ns: 'translation' })}
            tags={bookRequest?.tagLabels?.map((tag) =>
              t(tag.toLocaleLowerCase(), {
                ns: 'badges',
              }),
            )}
          />
          <Badges
            label={t('genres', { ns: 'badges' })}
            tags={bookRequest?.genreNames?.map((genre) =>
              t(genre.toLocaleLowerCase(), {
                ns: 'badges',
              }),
            )}
          />

          <PartiallyLoadedContent
            label={t('authors', { ns: 'translation' })}
            content={bookRequest?.authorNames?.join(', ')}
          />
          <PartiallyLoadedContent
            label={t('publisher', { ns: 'translation' })}
            content={bookRequest?.publisher}
          />
          <PartiallyLoadedContent
            label={t('publicationDate', { ns: 'translation' })}
            content={
              bookRequest?.publicationDate
                ? formatDate(bookRequest.publicationDate)
                : ''
            }
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              {t('viewDetails', { ns: 'translation' })}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="font-medium">
              {t('requestDetails', { ns: 'translation' })}
            </DialogTitle>

            <PartiallyLoadedContent
              label={t('requestedOn', { ns: 'translation' })}
              content={formatDate(bookRequest?.createdAt)}
            />
            <PartiallyLoadedContent
              label={t('lastUpdated', { ns: 'translation' })}
              content={formatDate(bookRequest?.updatedAt)}
            />

            {bookRequest.status === 'APPROVED' && (
              <PartiallyLoadedContent
                label={t('approvedOn', { ns: 'translation' })}
                content={formatDate(bookRequest?.approvedAt)}
              />
            )}

            {bookRequest.status === 'REJECTED' && (
              <>
                <PartiallyLoadedContent
                  label={t('rejectedOn', { ns: 'translation' })}
                  content={formatDate(bookRequest?.rejectedAt)}
                />
                <PartiallyLoadedContent
                  label={t('rejectionReason', { ns: 'translation' })}
                  content={bookRequest?.rejectionReason}
                  className="text-red-500"
                />
              </>
            )}

            {bookRequest.adminNotes && (
              <PartiallyLoadedContent
                label={t('adminNotes', { ns: 'translation' })}
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
                    {t('fileName', { ns: 'translation' })}:&nbsp;
                    {isDefined(bookFile.metadata) &&
                    'Title' in bookFile.metadata
                      ? bookFile.metadata['Title']
                      : bookFile.filename}
                  </p>

                  <p className="text-center">
                    <span>
                      {t('format', { ns: 'translation' })}: {bookFile.format}
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
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
