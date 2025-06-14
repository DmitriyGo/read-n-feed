import { isDefined } from '@read-n-feed/shared';
import { useTranslation } from 'react-i18next';

import { BookCard } from '../books';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { useGetLikedBooks } from '@/hooks';

export const LikedBooks = () => {
  const { t } = useTranslation();

  const { data } = useGetLikedBooks();

  const likedBooks = data?.data;

  if (!isDefined(likedBooks) || likedBooks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>{t('yourLikedBooks')}:</CardHeader>
      <CardContent className="flex flex-row gap-4 p-0 overflow-auto">
        {likedBooks.map((book) => (
          <BookCard key={book.id} isSimplified book={book} />
        ))}
      </CardContent>
    </Card>
  );
};
