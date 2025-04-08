import {
  AdminBookRequestsBlock,
  BookRequestSearchFilters,
} from '@/components/pages';

export const AdminBookRequestsPage = () => {
  return (
    <div className="grid grid-cols-[6fr,2fr] gap-4 items-stretch">
      <AdminBookRequestsBlock />

      <BookRequestSearchFilters isAdmin />
    </div>
  );
};
