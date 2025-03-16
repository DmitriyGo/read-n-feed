import { BookResponseDto } from '@read-n-feed/application';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Description,
  Image,
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
            <Image
              src={book.coverImageUrl}
              alt={book.title}
              className="object-cover !min-w-[130px] !h-[190px] md:!w-[155px] md:!h-[220px]"
            />
            <div className="flex flex-col justify-between">
              <h2 className="text-lg">{book.title}</h2>
              <p className="flex flex-row items-center gap-1">
                <Star className="text-sm" />
                <span>{book.averageRating}</span>
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
          <Card className="max-w-[90vw] md:max-w-[450px]">
            <CardHeader>{book.title}</CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
