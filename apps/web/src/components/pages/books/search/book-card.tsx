import { BookResponseDto } from '@read-n-feed/application';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import {
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { Route } from '@/constants';
import { useBreakpoint } from '@/hooks/use-breakpoint';

export const BookCard = ({
  book,
  isSimplified = false,
}: {
  book: BookResponseDto;
  isSimplified?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const isMd = useBreakpoint('md');

  return (
    <TooltipProvider>
      <Tooltip open={isOpen && !isSimplified} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <Link
            to={`${Route.Book.Details}/${book.id}`}
            className="w-min h-fit p-4 mx-auto"
          >
            <BookCover book={book} />

            <div className="flex flex-col space-y-1 justify-between">
              <h2 className="text-wrap text-clip">{book.title}</h2>
            </div>
          </Link>
        </TooltipTrigger>

        <TooltipContent
          className="[all:unset]"
          side={isMd ? 'right' : 'bottom'}
          align="start"
          sideOffset={12}
          avoidCollisions
        >
          <Card className="max-w-[90vw] md:max-w-[450px] ">
            <CardHeader>{book.title}</CardHeader>

            <CardContent className="space-y-2">
              <Description text={book.description} />

              {/* <p className="flex flex-row items-center gap-1">
                <Star />
                <span>{book.averageRating ?? '---'}</span>
              </p> */}

              <br />

              <PartiallyLoadedContent
                label={t('publisher')}
                content={book.publisher}
              />

              <PartiallyLoadedContent
                label={t('totalLikes')}
                content={book.totalLikes}
              />
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
