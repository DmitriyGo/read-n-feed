import { isDefined } from 'class-validator';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { BookCard } from './book-card';

import { Pagination, PerPage } from '@/components/common';
import { Card } from '@/components/ui';
import { useGetFilteredBooks } from '@/hooks/read/books/get-books-catalog';
import { useFilterStore } from '@/store';

export const BookCatalog = () => {
  const [urlSearchParams] = useSearchParams();

  const { getFilter, getSort } = useFilterStore();

  const [perPage, setPerPage] = useState<PerPage>(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data } = useGetFilteredBooks({
    authorName: getFilter(urlSearchParams, 'authorName'),
    genreName: getFilter(urlSearchParams, 'genreName'),
    tagName: getFilter(urlSearchParams, 'tagName'),
    title: getFilter(urlSearchParams, 'title'),
    sortOrder: getSort(urlSearchParams)?.sortOrder,
    sortBy: getSort<'title' | 'createdAt' | 'publicationDate'>(urlSearchParams)
      ?.name,
    limit: perPage,
    page: currentPage,
  });

  const filteredBooks = data?.data;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-wrap justify-between w-full h-fit gap-4">
        {isDefined(filteredBooks) &&
          filteredBooks.items.map((filteredBook) => (
            <BookCard key={filteredBook.id} book={filteredBook} />
          ))}
      </Card>

      <Pagination
        currentPage={currentPage}
        maxPages={filteredBooks?.totalPages || 1}
        onPerPageChange={setPerPage}
        perPage={perPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};
