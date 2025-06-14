import { isDefined } from '@read-n-feed/shared';
import { PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BookFile } from './book-file';

import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useBookFilesById } from '@/hooks';
import { useModalStore } from '@/store';

export const BookFiles = ({ bookId }: { bookId: string }) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);

  const { data } = useBookFilesById(bookId);

  const { setMode, setParam } = useModalStore();

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
            <BookFile key={bookFile.id} bookFile={bookFile} />
          ))}
      </CardContent>
    </Card>
  );
};
