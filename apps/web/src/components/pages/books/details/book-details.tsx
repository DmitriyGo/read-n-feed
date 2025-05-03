import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useTranslation } from 'react-i18next';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useAuth } from '@/hooks';
import { useLikeBook } from '@/hooks/write/books';
import { formatDate } from '@/lib';

export const BookDetails = ({ book }: { book?: BookResponseDto }) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const { mutate: likeBook } = useLikeBook();
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

  return (
    <Card className="[&:p]:text-sm">
      <CardHeader>
        <PartiallyLoadedContent
          as="h2"
          className="!text-2xl font-semibold [&>*]:!text-white"
          content={book?.title}
        />
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <div className="flex-[0_1_0%] flex-col flex justify-between space-y-2">
          <BookCover book={book} />
          <Button
            className="w-full"
            onClick={handleLike}
            disabled={!isDefined(accessToken)}
            variant={book?.liked ? 'default' : 'outline'}
          >
            {book?.liked ? t('unlike') : t('like')}
          </Button>
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
