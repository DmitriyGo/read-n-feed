import { zodResolver } from '@hookform/resolvers/zod';
import { SearchBooksDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import {
  Button,
  Input,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Card,
} from '@/components/ui';
import { useFilterStore } from '@/store';

const formSchema = z.object({
  title: z.string().optional(),
  authorName: z.string().optional(),
  genreName: z.string().optional(),
  tagName: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'publicationDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

type SearchBooksFormData = z.infer<typeof formSchema>;

export const SearchFilters = () => {
  const {
    updateFilter,
    updateSortBy,
    clearFilters,
    clearSort,
    saveFilters,
    getFilter,
    getSort,
  } = useFilterStore();

  const [searchParams, setSearchParams] = useSearchParams();

  const form = useForm<SearchBooksFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      authorName: '',
      genreName: '',
      tagName: '',
      sortBy: undefined,
      sortOrder: undefined,
    },
  });

  useEffect(() => {
    form.setValue('title', getFilter(searchParams, 'title') ?? '');
    form.setValue('authorName', getFilter(searchParams, 'authorName') ?? '');
    form.setValue('genreName', getFilter(searchParams, 'genreName') ?? '');
    form.setValue('tagName', getFilter(searchParams, 'tagName') ?? '');

    form.setValue(
      'sortBy',
      getSort<'title' | 'createdAt' | 'publicationDate'>(searchParams)?.name,
    );
    form.setValue(
      'sortOrder',
      getSort<'title' | 'createdAt' | 'publicationDate'>(searchParams)
        ?.sortOrder,
    );
  }, []);

  const onSubmit = (values: SearchBooksFormData) => {
    updateFilter({ name: 'title', value: values.title });
    updateFilter({ name: 'authorName', value: values.authorName });
    updateFilter({ name: 'genreName', value: values.genreName });
    updateFilter({ name: 'tagName', value: values.tagName });

    if (isDefined(values.sortBy) && isDefined(values.sortOrder)) {
      updateSortBy({
        name: values.sortBy,
        sortOrder: values.sortOrder,
      });
    }

    saveFilters(setSearchParams);
  };

  const handleClear = () => {
    clearFilters(setSearchParams);
    clearSort(setSearchParams);

    form.reset();
  };

  return (
    <Card className="w-full max-h-[calc(100vh-98px)] p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Name</FormLabel>
                <FormControl>
                  <Input placeholder="Author Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genreName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Input placeholder="Genre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag</FormLabel>
                <FormControl>
                  <Input placeholder="Tag" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort By</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="createdAt">Created At</SelectItem>
                      <SelectItem value="publicationDate">
                        Publication Date
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Save
          </Button>

          <Button
            type="reset"
            variant="destructive"
            className="w-full"
            onClick={handleClear}
          >
            Clear
          </Button>
        </form>
      </Form>
    </Card>
  );
};
