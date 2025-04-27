import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';

import {
  Badges,
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import { Button, Card, CardContent, CardHeader } from '@/components/ui';
import { useAuth } from '@/hooks';
import { useLikeBook } from '@/hooks/write/books';

export const BookDetails = ({ book }: { book?: BookResponseDto }) => {
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
            {book?.liked ? 'Unlike' : 'Like'}
          </Button>
        </div>

        <div className="space-y-2">
          <Description text={book?.description} />
          <Badges label="Tags" tags={book?.tags?.map((tag) => tag.label)} />
          <Badges label="Genres" tags={book?.genres?.map((tag) => tag.name)} />

          <PartiallyLoadedContent
            label="Authors"
            content={book?.authors?.map((author) => author.name).join(', ')}
          />
          <PartiallyLoadedContent label="Publisher" content={book?.publisher} />
          {isDefined(book?.publicationDate) && (
            <PartiallyLoadedContent
              label="Published at"
              content={new Date(
                String(book?.publicationDate),
              ).toLocaleDateString()}
            />
          )}
          <PartiallyLoadedContent
            label="Average Rating"
            content={book?.averageRating}
          />
          <PartiallyLoadedContent
            label="Total Likes"
            content={book?.totalLikes}
          />
        </div>
      </CardContent>
    </Card>
  );
};
