import { useParams } from 'react-router-dom';

import { BookDetails } from '@/components/pages/books/details';
import { useBookById } from '@/hooks/read/get-book';

export const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data } = useBookById(id);

  return (
    <div>
      <BookDetails book={data?.data} />
    </div>
  );
};
