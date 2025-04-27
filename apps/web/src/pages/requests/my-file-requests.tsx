import {
  FileRequestSearchFilters,
  MyFileRequestsBlock,
} from '@/components/pages';

export const MyFileRequestsPage = () => {
  return (
    <div className="grid grid-cols-[6fr,2fr] gap-4 items-stretch">
      <MyFileRequestsBlock />

      <FileRequestSearchFilters />
    </div>
  );
};
