import { BookFormatDto } from '@read-n-feed/application';
import { isDefined, shouldBeUnreachable } from '@read-n-feed/shared';
import { useParams } from 'react-router-dom';

import { PDFReader } from '@/components/pages';
import { useBookFilesById } from '@/hooks';

export const ReadPage = () => {
  const { bookId, fileId } = useParams<{ bookId: string; fileId: string }>();

  const { data } = useBookFilesById(bookId);

  const bookFileInfo = data?.data.find(
    (bookFileFetched) => bookFileFetched.id === fileId,
  );

  const fileFormat = bookFileInfo?.format as
    | keyof typeof BookFormatDto
    | undefined;

  if (!isDefined(bookFileInfo)) {
    return;
  }

  switch (fileFormat) {
    case 'PDF':
      return <PDFReader fileInfo={bookFileInfo} />;
    case 'EPUB':
      return <p>EPUB READER NOT IMPLEMENTED YET</p>;
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
