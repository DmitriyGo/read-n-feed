import {
  MyBookRequestsBlock,
  BookRequestSearchFilters,
} from '@/components/pages';

export const MyBookRequestsPage = () => {
  return (
    <div className="grid grid-cols-[6fr,2fr] gap-4 items-stretch">
      <MyBookRequestsBlock />

      <BookRequestSearchFilters />
    </div>
  );
};
