import { BookFormatDto } from '@read-n-feed/application';
import { isDefined, shouldBeUnreachable } from '@read-n-feed/shared';
import { useParams } from 'react-router-dom';

import { EpubReader, PDFReader } from '@/components/pages';
import {
  useBookFilesById,
  useBookRequestFilesById,
  useGetDownloadUrl,
  useGetMetadata,
} from '@/hooks';

export const ReadPage = () => {
  const { bookOrRequestId, fileId, type } = useParams<{
    bookOrRequestId: string;
    fileId: string;
    type: 'book' | 'request' | 'file-request';
  }>();

  const { data: bookData } = useBookFilesById(
    bookOrRequestId ?? '',
    type === 'book',
  );
  const { data: requestData } = useBookRequestFilesById(
    bookOrRequestId,
    type === 'request',
  );
  const { data: fileRequestData } = useGetMetadata({
    fileId,
    enabled: type === 'file-request',
  });
  const { data: downloadUrlData } = useGetDownloadUrl({
    fileId,
    enabled: type === 'file-request',
  });
  const bookRequestFiles = bookData?.data ?? requestData?.data;

  const bookFileInfo = bookRequestFiles?.find(
    (bookFileFetched) => bookFileFetched.id === fileId,
  );

  const fileFormat = (bookFileInfo?.format ?? fileRequestData?.data.format) as
    | keyof typeof BookFormatDto
    | undefined;

  const bookFileName =
    bookFileInfo?.filename ?? fileRequestData?.data.filename ?? '';

  const downloadUrl = bookFileInfo?.downloadUrl ?? downloadUrlData?.data.url;

  if (
    (!isDefined(bookFileInfo) && !isDefined(fileRequestData)) ||
    !isDefined(downloadUrl)
  ) {
    return;
  }

  switch (fileFormat) {
    case 'PDF':
      return <PDFReader downloadUrl={downloadUrl} filename={bookFileName} />;
    case 'EPUB':
      return <EpubReader downloadUrl={downloadUrl} filename={bookFileName} />;
    case 'FB2':
      return <p>FB2 READER NOT IMPLEMENTED YET</p>;
    case 'MOBI':
      return <p>MOBI READER NOT IMPLEMENTED YET</p>;
    case 'AZW3':
      return <p>AZW3 READER NOT IMPLEMENTED YET</p>;
    case undefined:
      throw new Error('Unknown file format');
    default:
      shouldBeUnreachable(fileFormat);
      break;
  }
};
