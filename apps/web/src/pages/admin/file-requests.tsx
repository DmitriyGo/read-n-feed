import {
  AdminFileRequestsBlock,
  FileRequestSearchFilters,
} from '@/components/pages';

export const AdminFileRequestsPage = () => {
  return (
    <div className="flex flex-col lg:grid grid-cols-[6fr,2fr] gap-4 items-stretch">
      <AdminFileRequestsBlock />

      <FileRequestSearchFilters isAdmin />
    </div>
  );
};
