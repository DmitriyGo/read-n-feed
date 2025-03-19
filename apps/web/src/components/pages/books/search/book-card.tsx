import { Thumb } from '@radix-ui/react-switch';
import { BookResponseDto } from '@read-n-feed/application';
import { Heart, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  BookCover,
  Description,
  PartiallyLoadedContent,
} from '@/components/common';
import {
  Button,
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

export const BookCard = ({ book }: { book: BookResponseDto }) => {
  const isMd = useBreakpoint('md');

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${Route.Book.Details}/${book.id}`);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-fit h-fit p-4" onClick={handleClick}>
            <BookCover book={book} />

            <div className="flex flex-col space-y-1 justify-between">
              <h2>{book.title}</h2>
              <p className="flex flex-row items-center gap-1">
                <Star />
                <span>{book.averageRating ?? '---'}</span>
              </p>
            </div>
          </div>
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

              <br />

              <PartiallyLoadedContent
                label="Publisher"
                content={book.publisher}
              />

              <PartiallyLoadedContent
                label="Total likes"
                content={book.totalLikes}
              />

              <div className="flex flow-row justify-between gap-2">
                <Button
                  variant={book.liked === true ? 'outline' : 'ghost'}
                  className="w-full"
                >
                  <ThumbsUp />
                </Button>
                <Button
                  variant={book.liked === false ? 'outline' : 'ghost'}
                  className="w-full"
                >
                  <ThumbsDown />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
