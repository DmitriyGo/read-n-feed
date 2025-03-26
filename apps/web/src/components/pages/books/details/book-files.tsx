import { isDefined } from '@read-n-feed/shared';

import { useBookFilesById } from '@/hooks';

export const BookFiles = ({ id }: { id?: string }) => {
  const { data } = useBookFilesById(id);

  return (
    <div>
      {isDefined(data?.data) &&
        data.data.map((bookFile) => (
          <div>
            {bookFile.filename} - {bookFile.format} -{' '}
            <a href={bookFile.downloadUrl}>URL</a>
          </div>
        ))}
    </div>
  );
};
