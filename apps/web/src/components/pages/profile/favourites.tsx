import { isDefined } from '@read-n-feed/shared';
import { useTranslation } from 'react-i18next';

import { BookCard } from '../books';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { useGetFavouriteBooks } from '@/hooks';

export const FavouriteBooks = () => {
  const { t } = useTranslation();

  const { data } = useGetFavouriteBooks();

  const favouriteBooks = data?.data;

  if (!isDefined(favouriteBooks) || favouriteBooks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>{t('favorites')}:</CardHeader>
      <CardContent className="flex flex-1 flex-wrap justify-start w-full h-fit gap-4 p-0">
        {favouriteBooks?.length &&
          favouriteBooks.map((book) => (
            <BookCard key={book.id} isSimplified book={book} />
          ))}
      </CardContent>
    </Card>
  );
};
