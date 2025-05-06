import { DialogTrigger } from '@radix-ui/react-dialog';
import { BookFileRequestResponseDto } from '@read-n-feed/application';
import { format } from 'date-fns';
import { FileQuestion, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { PartiallyLoadedContent } from '@/components/common';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui';
import { Route } from '@/constants';
import { useDeleteFileRequest, useHasRole, useGetDownloadUrl } from '@/hooks';
import { formatDate } from '@/lib';
import { useModalStore } from '@/store';

export const FileRequestItem = ({
  fileRequest,
}: {
  fileRequest: BookFileRequestResponseDto;
}) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { pathname } = useLocation();

  const { setMode, setParam } = useModalStore();

  const { hasRole: isAdmin } = useHasRole('ADMIN');
  const isOnAdminPage = pathname.includes('admin');

  const { data } = useGetDownloadUrl({
    fileId: fileRequest.fileId,
  });
  const downloadUrl = data?.data?.url;

  const { mutate: deleteFileRequest } = useDeleteFileRequest();

  const handleDelete = () => {
    deleteFileRequest({
      fileRequestId: fileRequest.id,
    });
  };

  const handleVerify = () => {
    setParam('requestId', fileRequest.id);
    setParam('requestType', 'file');
    setMode('VerifyRequest');
  };

  return (
    <Card className="w-fit">
      <CardHeader className="flex flex-row items-center justify-between">
        <PartiallyLoadedContent
          as="h2"
          className="!text-2xl font-semibold [&>*]:!text-white"
          content={fileRequest?.fileInfo?.filename}
        />

        <div className="gap-4 items-center flex justify-center">
          <Badge
            variant={
              fileRequest.status === 'APPROVED'
                ? 'default'
                : fileRequest.status === 'PENDING'
                  ? 'outline'
                  : 'destructive'
            }
          >
            {t(fileRequest.status.toLowerCase())}
          </Badge>

          {fileRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 />
            </Button>
          )}

          {/* Show the verify button only for admins on admin routes when the request is pending */}
          {isAdmin && isOnAdminPage && fileRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleVerify}>
              <FileQuestion />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-row flex-wrap gap-4">
        <div className="border-l pl-4">
          <h3 className="font-medium">{t('bookDetails')}</h3>

          <PartiallyLoadedContent
            label={t('bookName')}
            content={fileRequest?.bookInfo?.title}
          />

          <Link to={`${Route.Book.Details}/${fileRequest.bookId}`}>
            <Button>{t('open')}</Button>
          </Link>
        </div>

        <div className="border-l pl-4">
          <h3 className="font-medium">{t('fileDetails')}</h3>

          <PartiallyLoadedContent
            label={t('fileSize')}
            content={fileRequest?.fileInfo?.fileSize + ' KB'}
          />

          <div className="flex flex-wrap gap-4">
            <Link to={downloadUrl || ''} target="_blank">
              <Button>{t('download')}</Button>
            </Link>

            <Link
              to={Route.Book.Read(
                '-',
                fileRequest.fileId ?? '',
                'file-request',
              )}
            >
              <Button>{t('read')}</Button>
            </Link>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              {t('viewDetails')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="font-medium">
              {t('requestDetails')}
            </DialogTitle>

            <PartiallyLoadedContent
              label={t('requestedOn')}
              content={formatDate(fileRequest?.createdAt)}
            />
            <PartiallyLoadedContent
              label={t('lastUpdated')}
              content={formatDate(fileRequest?.updatedAt)}
            />

            {fileRequest.status === 'APPROVED' && (
              <PartiallyLoadedContent
                label={t('approvedOn')}
                content={formatDate(fileRequest?.approvedAt)}
              />
            )}

            {fileRequest.status === 'REJECTED' && (
              <>
                <PartiallyLoadedContent
                  label={t('rejectedOn')}
                  content={formatDate(fileRequest?.rejectedAt)}
                />
                <PartiallyLoadedContent
                  label={t('rejectionReason')}
                  content={fileRequest?.rejectionReason}
                  className="text-red-500"
                />
              </>
            )}

            {fileRequest.adminNotes && (
              <PartiallyLoadedContent
                label={t('adminNotes')}
                content={fileRequest?.adminNotes}
                className="text-blue-500"
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
