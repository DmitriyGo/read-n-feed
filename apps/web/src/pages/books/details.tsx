import { useNavigate, useParams } from 'react-router-dom';

import { BookComments, BookDetails, BookFiles } from '@/components/pages';
import { Route } from '@/constants';
import { useBookById } from '@/hooks';

export const BookDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data } = useBookById(id);

  if (!id) {
    navigate(Route.Book.Search);
    return null;
  }

  return (
    <div className="space-y-4">
      <BookDetails book={data?.data} />

      <BookFiles bookId={id} />

      <BookComments bookId={id} />
    </div>
  );
};
