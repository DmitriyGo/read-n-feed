import { BookResponseDto } from '@read-n-feed/application';

import { Image } from '../image';

import { useBreakpoint } from '@/hooks';

export const BookCover = ({ book }: { book?: BookResponseDto }) => {
  const isMd = useBreakpoint('md');

  return (
    <Image
      src={book?.coverImageUrl}
      alt={book?.title}
      width={isMd ? 155 : 140}
      height={isMd ? 220 : 190}
      className="object-cover"
    />
  );
};
