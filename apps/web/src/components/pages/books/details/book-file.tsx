import { BookFileResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { Link2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';
import { Route } from '@/constants';
import { useDeleteFile, useHasRole } from '@/hooks';

export const BookFile = ({ bookFile }: { bookFile: BookFileResponseDto }) => {
  const { hasRole: isAdmin } = useHasRole('ADMIN');

  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const navigate = useNavigate();

  const { mutateAsync: deleteFile } = useDeleteFile();

  const handleOpen = (fileId: string) => {
    if (!isDefined(bookFile.bookId)) {
      return;
    }

    navigate(Route.Book.Read(bookFile.bookId, fileId, 'book'));
  };

  return (
    <div
      onClick={() => handleOpen(bookFile.id)}
      className="border p-2 flex flex-col md:flex-row items-center [&>*]:w-full cursor-pointer hover:scale-[1.01] duration-100 transition-all"
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
      {
        <p className="text-center">
          <span>
            {t('language')}: {t(bookFile.language ?? 'ua')}
          </span>
        </p>
      }

      <div className="flex justify-end gap-2 items-center">
        {isAdmin && (
          <Button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();

              await deleteFile({
                fileId: bookFile.id,
                bookId: bookFile.bookId ?? '',
              });
            }}
            variant={'destructive'}
          >
            <Trash2 />
          </Button>
        )}

        <a href={bookFile.downloadUrl}>
          <Link2 />
        </a>
      </div>
    </div>
  );
};
