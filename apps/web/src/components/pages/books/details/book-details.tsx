import { BookResponseDto } from '@read-n-feed/application';

import {
  Badges,
  Description,
  Image,
  PartiallyLoadedContent,
} from '@/components/common';
import { Card, CardContent, CardHeader } from '@/components/ui';

export const BookDetails = ({ book }: { book?: BookResponseDto }) => {
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
        <Image
          src={book?.coverImageUrl}
          alt={book?.title}
          width={175}
          height={250}
        />

        <div className="space-y-2">
          <Description text={book?.description} />
          <Badges label="Tags" tags={book?.tags?.map((tag) => tag.label)} />
          <Badges label="Genres" tags={book?.genres?.map((tag) => tag.name)} />

          <PartiallyLoadedContent
            label="Authors"
            content={book?.authors?.map((author) => author.name).join(', ')}
          />
          <PartiallyLoadedContent label="Publisher" content={book?.publisher} />
          <PartiallyLoadedContent
            label="Published at"
            content={new Date(
              String(book?.publicationDate),
            ).toLocaleDateString()}
          />
          <PartiallyLoadedContent
            label="Average Rating"
            content={book?.averageRating}
          />
          <PartiallyLoadedContent
            label="Total Likes"
            content={book?.totalLikes}
          />
          <PartiallyLoadedContent label="Liked" content={book?.liked} />
        </div>
      </CardContent>
    </Card>
  );
};
