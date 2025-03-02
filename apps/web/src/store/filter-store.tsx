import { isDefined } from '@read-n-feed/shared';
import { SetURLSearchParams } from 'react-router-dom';
import { create } from 'zustand';

type SortBy<TName extends string = string> = {
  name: TName;
  sortOrder: 'asc' | 'desc';
};

type FilterStore = {
  filters: Record<string, string>;
  sortBy?: SortBy;

  init: (urlParams: URLSearchParams) => void;

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

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: {},
  sortBy: undefined,

  init(urlParams) {
    set(() => {
      const newFilters: Record<string, string> = {};

      Array.from(urlParams.entries()).forEach((param) => {
        if (param[0].startsWith('filter_')) {
          newFilters[param[0].replace('filter_', '')] = param[1];
        }
      });

      return {
        filters: newFilters,
      };
    });
  },

  updateFilter(filter) {
    set(({ filters }) => {
      const newFilters = {
        ...filters,
      };

      if (!isDefined(filter.value) || filter.value === '') {
        delete newFilters[filter.name];
      } else {
        newFilters[filter.name] = filter.value;
      }

      return {
        filters: newFilters,
      };
    });
  },

  updateSortBy(newValues) {
    set(() => ({
      sortBy: newValues,
    }));
  },

  clearFilters(setUrlParams) {
    set(({ filters }) => {
      setUrlParams((prevParams) => {
        Object.keys(filters).forEach((key) => {
          prevParams.delete(`filter_${key}`);
        });

        return prevParams;
      });

      return {
        filters: {},
      };
    });
  },

  clearSort(setUrlParams) {
    set(() => {
      setUrlParams((prevParams) => {
        prevParams.delete('sort_by');
        prevParams.delete('sort_order');

        return prevParams;
      });

      return {
        sortBy: undefined,
      };
    });
  },

  saveFilters(setUrlParams) {
    const { filters, sortBy } = get();

    setUrlParams(
      (prevParams) => {
        Object.entries(filters).forEach(([key, value]) => {
          prevParams.set(`filter_${key}`, value);
        });

        if (sortBy) {
          prevParams.set('sort_by', sortBy.name);
          prevParams.set('sort_order', sortBy.sortOrder);
        } else {
          prevParams.delete('sort_by');
          prevParams.delete('sort_order');
        }

        return prevParams;
      },
      {
        preventScrollReset: true,
      },
    );
  },

  getFilter(urlParams, name) {
    return urlParams.get(`filter_${name}`) ?? undefined;
  },

  getSort<TName>(urlParams: URLSearchParams) {
    const by = urlParams.get('sort_by') ?? undefined;
    const order = urlParams.get('sort_order') ?? undefined;

    if (order !== 'asc' && order !== 'desc' && isDefined(order)) {
      throw Error('Invalid order value');
    }

    return isDefined(by) && isDefined(order)
      ? {
          name: by as TName,
          sortOrder: order,
        }
      : undefined;
  },
}));
