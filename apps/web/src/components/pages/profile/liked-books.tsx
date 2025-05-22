import { useTranslation } from 'react-i18next';

import { BookCard } from '../books';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { useGetLikedBooks } from '@/hooks';

export const LikedBooks = () => {
  const { t } = useTranslation();

  const { data } = useGetLikedBooks();

  const likedBooks = data?.data;

  return (
    <Card>
      <CardHeader>{t('yourLikedBooks')}:</CardHeader>
      <CardContent className="flex flex-row gap-4 p-0 overflow-auto">
        {likedBooks?.length &&
          likedBooks.map((book) => (
            <BookCard key={book.id} isSimplified book={book} />
          ))}
      </CardContent>
    </Card>
  );
};
