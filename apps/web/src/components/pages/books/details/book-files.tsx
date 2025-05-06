import { isDefined } from '@read-n-feed/shared';
import { Link2, PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { Route } from '@/constants';
import { useBookFilesById } from '@/hooks';
import { useModalStore } from '@/store';

export const BookFiles = ({ bookId }: { bookId?: string }) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { data } = useBookFilesById(bookId);

  const { setMode, setParam } = useModalStore();

  const navigate = useNavigate();

  const handleOpen = (fileId: string) => {
    if (!isDefined(bookId)) {
      return;
    }

    navigate(Route.Book.Read(bookId, fileId, 'request'));
  };

  const handleNewFile = () => {
    setMode('CreateFileRequest');
    setParam('bookId', bookId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <p className="text-lg ">{t('bookFiles')}</p>

        <Button className="aspect-square !p-1" onClick={handleNewFile}>
          <PlusSquare />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {isDefined(data?.data) &&
          data.data.map((bookFile) => (
            <div
              key={bookFile.id}
              onClick={() => handleOpen(bookFile.id)}
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
      </CardContent>
    </Card>
  );
};
