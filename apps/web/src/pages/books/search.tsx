import {
  BookCatalog,
  BookRecommendations,
  SearchFilters,
} from '@/components/pages/books/search';

export const BookSearchPage = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[6fr,2fr] gap-4 items-stretch">
        <BookCatalog />

        <SearchFilters />
      </div>

      <BookRecommendations />
    </div>
  );
};
