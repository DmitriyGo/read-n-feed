import { BookFileRequestResponseDto } from '@read-n-feed/application';
import { format } from 'date-fns';
import { Check, Trash2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { PartiallyLoadedContent } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader } from '@/components/ui';
import { Route } from '@/constants';
import {
  useDeleteFileRequest,
  useHasRole,
  useGetDownloadUrl,
  useVerifyFileRequest,
} from '@/hooks';

const formatDate = (date?: Date | null) => {
  return date ? format(new Date(date), 'MMM d, yyyy') : '';
};

export const FileRequestItem = ({
  fileRequest,
}: {
  fileRequest: BookFileRequestResponseDto;
}) => {
  const { pathname } = useLocation();

  const { hasRole: isAdmin } = useHasRole('ADMIN');
  const isOnAdminPage = pathname.includes('admin');

  const { data } = useGetDownloadUrl({
    fileId: fileRequest.fileId,
  });
  const downloadUrl = data?.data?.url;

  const { mutate: deleteFileRequest } = useDeleteFileRequest();
  const { mutate: verifyFileRequest } = useVerifyFileRequest();

  const handleDelete = () => {
    deleteFileRequest({
      fileRequestId: fileRequest.id,
    });
  };

  const handleVerify = () => {
    verifyFileRequest({
      requestId: fileRequest.id,
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
            {fileRequest.status}
          </Badge>

          {fileRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 />
            </Button>
          )}

          {/* Show the verify button only for admins on admin routes when the request is pending */}
          {isAdmin && isOnAdminPage && fileRequest.status === 'PENDING' && (
            <Button variant="outline" onClick={handleVerify}>
              <Check />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-row flex-wrap gap-4">
        <div className="border-l pl-4">
          <h3 className="font-medium">Book Details</h3>

          <PartiallyLoadedContent
            label="Book Name"
            content={fileRequest?.bookInfo?.title}
          />

          <Link to={`${Route.Book.Details}/${fileRequest.bookId}`}>
            <Button>Open</Button>
          </Link>
        </div>

        <div className="border-l pl-4">
          <h3 className="font-medium">File details</h3>

          <PartiallyLoadedContent
            label="File Size"
            content={fileRequest?.fileInfo?.fileSize + ' KB'}
          />

          <div className="flex flex-wrap gap-4">
            <Link to={downloadUrl || ''} target="_blank">
              <Button>Download</Button>
            </Link>

            <Link
              to={Route.Book.Read(
                '-',
                fileRequest.fileId ?? '',
                'file-request',
              )}
            >
              <Button>Read</Button>
            </Link>
          </div>
        </div>

        <div className="border-l pl-4">
          <h3 className="font-medium">Request Details</h3>

          <PartiallyLoadedContent
            label="Requested on"
            content={formatDate(fileRequest?.createdAt)}
          />
          <PartiallyLoadedContent
            label="Last Updated"
            content={formatDate(fileRequest?.updatedAt)}
          />

          {fileRequest.status === 'APPROVED' && (
            <PartiallyLoadedContent
              label="Approved on"
              content={formatDate(fileRequest?.approvedAt)}
            />
          )}

          {fileRequest.status === 'REJECTED' && (
            <>
              <PartiallyLoadedContent
                label="Rejected on"
                content={formatDate(fileRequest?.rejectedAt)}
              />
              <PartiallyLoadedContent
                label="Rejection Reason"
                content={fileRequest?.rejectionReason}
                className="text-red-500"
              />
            </>
          )}

          {fileRequest.adminNotes && (
            <PartiallyLoadedContent
              label="Admin Notes"
              content={fileRequest?.adminNotes}
              className="text-blue-500"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
