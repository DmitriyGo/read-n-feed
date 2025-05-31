import { useTranslation } from 'react-i18next';

import { BookCard } from './book-card';

import { Card, CardContent, CardHeader } from '@/components/ui';
import { usePersonalizedRecommendations } from '@/hooks';

export const BookRecommendations = () => {
  const { t } = useTranslation();

  const { data } = usePersonalizedRecommendations({ includeRead: false });

  const forYouRecommendations = data?.data.forYou.books;

  return (
    <Card>
      <CardHeader>{t('recommendations')}:</CardHeader>
      <CardContent className="flex flex-row gap-4 p-0 overflow-auto">
        {forYouRecommendations?.length &&
          forYouRecommendations.map((book) => (
            <BookCard
              key={book.bookId}
              isSimplified
              book={{
                id: book.bookId,
                title: book.bookDetails?.title ?? '',
                authors: book.bookDetails?.authors,
                genres: book.bookDetails?.genres,
                coverImageUrl: book.bookDetails?.coverImageUrl,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
            />
          ))}
      </CardContent>
    </Card>
  );
};
