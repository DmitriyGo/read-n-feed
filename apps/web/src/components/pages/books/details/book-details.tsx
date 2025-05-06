import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { Heart, HeartOff, Star, StarOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useAuth, useFavouriteBook, useLikeBook } from '@/hooks';
import { formatDate } from '@/lib';

export const BookDetails = ({ book }: { book?: BookResponseDto }) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { mutate: likeBook } = useLikeBook();
  const { mutate: favouriteBook } = useFavouriteBook();
  const { accessToken } = useAuth();

  const handleLike = () => {
    if (!book) {
      return;
    }

    likeBook({
      bookId: book.id,
      userWantsToLike: !book.liked,
    });
  };

  const handleFavourite = () => {
    if (!book) {
      return;
    }

    favouriteBook({
      bookId: book.id,
      userWantsToFavourite: true,
      // userWantsToFavourite: !book.favoured,
    });
  };

  return (
    <Card className="[&:p]:text-sm">
      <CardHeader className="flex flex-row justify-between">
        <PartiallyLoadedContent
          as="h2"
          className="!text-2xl font-semibold [&>*]:!text-white"
          content={book?.title}
        />

        <div className="space-x-4">
          <Button
            onClick={handleLike}
            disabled={!isDefined(accessToken)}
            variant={book?.liked ? 'default' : 'outline'}
          >
            {book?.liked ? <Heart /> : <HeartOff />}
          </Button>
          <Button
            onClick={handleFavourite}
            disabled={!isDefined(accessToken)}
            variant={'default'}
            // variant={book?.favoured ? 'default' : 'outline'}
          >
            {book?.liked ? <Star /> : <StarOff />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <div className="flex-[0_1_0%]">
          <BookCover book={book} />
        </div>

        <div className="space-y-2">
          <Description text={book?.description} />
          <Badges
            label={t('tags')}
            tags={book?.tags?.map((tag) =>
              t(tag.label.toLocaleLowerCase(), { ns: 'badges' }),
            )}
          />
          <Badges
            label={t('genres')}
            tags={book?.genres?.map((tag) =>
              t(tag.name.toLocaleLowerCase(), { ns: 'badges' }),
            )}
          />

          <PartiallyLoadedContent
            label={t('authors')}
            content={book?.authors?.map((author) => author.name).join(', ')}
          />
          <PartiallyLoadedContent
            label={t('publisher')}
            content={book?.publisher}
          />
          {isDefined(book?.publicationDate) && (
            <PartiallyLoadedContent
              label={t('publishedAt')}
              content={formatDate(book?.publicationDate)}
            />
          )}
          <PartiallyLoadedContent
            label={t('averageRating')}
            content={book?.averageRating}
          />
          <PartiallyLoadedContent
            label={t('totalLikes')}
            content={book?.totalLikes}
          />
        </div>
      </CardContent>
    </Card>
  );
};
