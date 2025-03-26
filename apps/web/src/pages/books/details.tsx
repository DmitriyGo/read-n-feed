import { useParams } from 'react-router-dom';

import { BookDetails, BookFiles } from '@/components/pages/books/details';
import { useBookById } from '@/hooks/read/books/get-book';

export const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data } = useBookById(id);

  return (
    <div className="space-y-4">
      <BookDetails book={data?.data} />

      <BookFiles bookId={id} />
    </div>
  );
};
