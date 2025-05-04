import { zodResolver } from '@hookform/resolvers/zod';
import { SearchBooksDto } from '@read-n-feed/application';
import { isDefined } from '@read-n-feed/shared';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
                <FormLabel>{t('title')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('title')} {...field} />
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
                <FormLabel>{t('authorName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('authorName')} {...field} />
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
                <FormLabel>{t('genre')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('genre')} {...field} />
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
                <FormLabel>{t('tag')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('tag')} {...field} />
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
                <FormLabel>{t('sortBy')}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">{t('title')}</SelectItem>
                      <SelectItem value="createdAt">
                        {t('createdAt')}
                      </SelectItem>
                      <SelectItem value="publicationDate">
                        {t('publicationDate')}
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
                <FormLabel>{t('sortOrder')}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('sortOrder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">{t('ascending')}</SelectItem>
                      <SelectItem value="desc">{t('descending')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {t('save')}
          </Button>

          <Button
            type="reset"
            variant="destructive"
            className="w-full"
            onClick={handleClear}
          >
            {t('clear')}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
