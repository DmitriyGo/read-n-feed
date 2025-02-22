import { BookResponseDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';

import { Description } from '../shared/description';

import { Image, PartiallyLoadedContent } from '@/components/common';
import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui';

export const BookDetails = ({ book }: { book: BookResponseDto }) => {
  return (
    <Card className="[&:p]:text-sm">
      <CardHeader>
        <h2 className="!text-xl font-semibold">{book.title}</h2>
      </CardHeader>

      <CardContent className="flex flex-row gap-4">
        <Image
          src={book.coverImageUrl}
          alt={book.title}
          width={175}
          height={250}
        />

        <div className="space-y-2">
          {isDefined(book.description) ? (
            <Description text={book.description} />
          ) : (
            <Skeleton className="h-[24px]" />
          )}

          {/* <Tags tags={book.tags} /> */}

          {/* <PartiallyLoadedContent
            label="Authors"
            content={book.authors.join(', ')}
          /> */}
          <PartiallyLoadedContent label="Publisher" content={book.publisher} />
          {/* <PartiallyLoadedContent
            label="Published at"
            content={new Date(book.publishedAt).toLocaleDateString()}
          /> */}
          {/* <PartiallyLoadedContent label="Page count" content={book.pages} /> */}
        </div>
      </CardContent>
    </Card>
  );
};
