import { useTranslation } from 'react-i18next';

import {
  Pagination as BasePagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { cn } from '@/lib';

export type PerPage = 10 | 20 | 30;

export const Pagination = ({
  perPage,
  onPerPageChange,
  currentPage,
  maxPages,
  setCurrentPage,
  className,
}: {
  perPage: PerPage;
  onPerPageChange: (value: PerPage) => void;
  maxPages: number;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  className?: string;
}) => {
  const { t } = useTranslation();

  const handlePerPageChange = (value: PerPage) => {
    onPerPageChange(value);
    setCurrentPage(1);
  };

  let pages: Array<number>;
  let mode: 'start' | 'middle' | 'end' | 'not-enough';

  if (currentPage <= 3 && maxPages > 5) {
    pages = [1, 2, 3, 4, 5];
    mode = 'start';
  } else if (currentPage >= maxPages - 2 && maxPages > 5) {
    pages = [maxPages - 4, maxPages - 3, maxPages - 2, maxPages - 1, maxPages];
    mode = 'end';
  } else if (maxPages > 5) {
    pages = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
    mode = 'middle';
  } else {
    pages = Array.from({ length: maxPages }, (_, i) => i + 1);
    mode = 'not-enough';
  }

  return (
    <div
      className={cn(className, 'w-full items-center justify-between md:flex')}
    >
      <div className="flex items-center gap-2">
        <p className="text-[12px] md:text-[14px] text-nowrap">
          {t('showPerPage')}
        </p>
        <Select
          value={String(perPage)}
          defaultValue="10"
          onValueChange={(value) =>
            handlePerPageChange(Number(value) as PerPage)
          }
        >
          <SelectTrigger className="py-1 px-2">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="">
            <SelectGroup>
              <SelectItem className="" value={'10'}>
                10
              </SelectItem>

              <SelectItem className="" value={'20'}>
                20
              </SelectItem>

              <SelectItem className="" value={'30'}>
                30
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <BasePagination className="flex justify-end">
        <PaginationContent>
          <PaginationItem
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
          >
            <PaginationPrevious>{t('previous')}</PaginationPrevious>
          </PaginationItem>

          {mode === 'start' && (
            <>
              {pages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => {
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink
                  onClick={() => {
                    setCurrentPage(maxPages);
                  }}
                  isActive={currentPage === maxPages}
                >
                  {maxPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {mode === 'middle' &&
            pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => {
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          {mode === 'end' && (
            <>
              <PaginationItem>
                <PaginationLink
                  onClick={() => {
                    setCurrentPage(1);
                  }}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>

              {pages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => {
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
            </>
          )}

          {mode === 'not-enough' &&
            pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => {
                    setCurrentPage(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

          <PaginationItem
            onClick={() => {
              if (currentPage < maxPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
          >
            <PaginationNext>{t('next')}</PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </BasePagination>
    </div>
  );
};
