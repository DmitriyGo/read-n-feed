import { isDefined } from '@read-n-feed/shared';
import { SetURLSearchParams } from 'react-router-dom';
import { create } from 'zustand';

type SortOrder = 'asc' | 'desc';

type SortBy<TName extends string = string> = {
  name: TName;
  sortOrder: SortOrder;
};

type Filters = Record<string, string>;

type FilterState = {
  filters: Filters;
  sortBy?: SortBy;
  currentPage: number;
  maxPages: number;
};

type FilterActions = {
  init: (urlParams: URLSearchParams) => void;

  setCurrentPage: (newCurrentPage: number) => void;
  setMaxPages: (newMaxPages: number) => void;

  updateFilter: (newFilter: { name: string; value?: string }) => void;
  updateSortBy: (newSort: SortBy) => void;
  clearFilters: (setUrlParams: SetURLSearchParams) => void;
  clearSort: (setUrlParams: SetURLSearchParams) => void;
  saveFilters: (setUrlParams: SetURLSearchParams) => void;

  getFilter: (urlParams: URLSearchParams, name: string) => string | undefined;
  getSort: <TName extends string>(
    urlParams: URLSearchParams,
  ) => SortBy<TName> | undefined;
};

const URL_PREFIX = {
  FILTER: 'filter_',
  SORT_BY: 'sort_by',
  SORT_ORDER: 'sort_order',
};

const parseFilterKey = (key: string): string => {
  return key.startsWith(URL_PREFIX.FILTER)
    ? key.replace(URL_PREFIX.FILTER, '')
    : key;
};

const createFilterKey = (name: string): string => {
  return `${URL_PREFIX.FILTER}${name}`;
};

const isValidSortOrder = (order?: string): order is SortOrder => {
  return order === 'asc' || order === 'desc';
};

export const useFilterStore = create<FilterState & FilterActions>(
  (set, get) => ({
    filters: {},
    sortBy: undefined,
    currentPage: 0,
    maxPages: 0,

    init(urlParams) {
      set(({ getSort }) => {
        const newFilters: Record<string, string> = {};

        Array.from(urlParams.entries()).forEach(([key, value]) => {
          if (key.startsWith(URL_PREFIX.FILTER)) {
            newFilters[parseFilterKey(key)] = value;
          }
        });

        const sortBy = getSort(urlParams);

        return {
          filters: newFilters,
          sortBy,
        };
      });
    },

    setCurrentPage(newCurrentPage) {
      set({ currentPage: newCurrentPage });
    },

    setMaxPages(newMaxPages) {
      set({ maxPages: newMaxPages });
    },

    updateFilter({ name, value }) {
      set(({ filters }) => {
        const newFilters = { ...filters };

        if (!isDefined(value) || value === '') {
          delete newFilters[name];
        } else {
          newFilters[name] = value;
        }

        return { filters: newFilters };
      });
    },

    updateSortBy(newValues) {
      set({ sortBy: newValues });
    },

    clearFilters(setUrlParams) {
      const { filters } = get();

      setUrlParams((prevParams) => {
        Object.keys(filters).forEach((key) => {
          prevParams.delete(createFilterKey(key));
        });

        return prevParams;
      });

      set({ filters: {} });
    },

    clearSort(setUrlParams) {
      setUrlParams((prevParams) => {
        prevParams.delete(URL_PREFIX.SORT_BY);
        prevParams.delete(URL_PREFIX.SORT_ORDER);
        return prevParams;
      });

      set({ sortBy: undefined });
    },

    saveFilters(setUrlParams) {
      const { filters, sortBy } = get();

      setUrlParams(
        (prevParams) => {
          Array.from(prevParams.keys()).forEach((key) => {
            if (key.startsWith(URL_PREFIX.FILTER)) {
              prevParams.delete(key);
            }
          });

          Object.entries(filters).forEach(([key, value]) => {
            if (isDefined(value) && value !== '') {
              prevParams.set(createFilterKey(key), value);
            }
          });

          if (sortBy) {
            prevParams.set(URL_PREFIX.SORT_BY, sortBy.name);
            prevParams.set(URL_PREFIX.SORT_ORDER, sortBy.sortOrder);
          } else {
            prevParams.delete(URL_PREFIX.SORT_BY);
            prevParams.delete(URL_PREFIX.SORT_ORDER);
          }

          return prevParams;
        },
        { preventScrollReset: true },
      );
    },

    getFilter(urlParams, name) {
      return urlParams.get(createFilterKey(name)) ?? undefined;
    },

    getSort<TName>(urlParams: URLSearchParams) {
      const name = urlParams.get(URL_PREFIX.SORT_BY) ?? undefined;
      const order = urlParams.get(URL_PREFIX.SORT_ORDER) ?? undefined;

      if (isDefined(order) && !isValidSortOrder(order)) {
        console.error(`Invalid sort order: ${order}`);
        return undefined;
      }

      return isDefined(name) && isValidSortOrder(order)
        ? { name: name as TName, sortOrder: order }
        : undefined;
    },
  }),
);
