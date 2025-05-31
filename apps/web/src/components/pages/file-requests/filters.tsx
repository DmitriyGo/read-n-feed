import { zodResolver } from '@hookform/resolvers/zod';
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
import { AcceptedStatus, AcceptedStatuses } from '@/constants';
import { useFilterStore } from '@/store';

const formSchema = z.object({
  status: z.enum(AcceptedStatuses).optional(),
  bookId: z.string().uuid().optional(),
  title: z.string().optional(),
});

type SearchBooksFormData = z.infer<typeof formSchema>;

export const FileRequestSearchFilters = ({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) => {
  const { t } = useTranslation(['translation', 'validation', 'badges']);

  const form = useForm<SearchBooksFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      status: undefined,
    },
  });

  const { updateFilter, clearFilters, clearSort, saveFilters, getFilter } =
    useFilterStore();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    form.setValue('title', getFilter(searchParams, 'title') ?? '');
    form.setValue(
      'status',
      (getFilter(searchParams, 'status') as AcceptedStatus) ?? '',
    );
    form.setValue('bookId', getFilter(searchParams, 'bookId') ?? '');
  }, []);

  const onSubmit = (values: SearchBooksFormData) => {
    updateFilter({ name: 'title', value: values.title });
    updateFilter({ name: 'status', value: values.status });
    updateFilter({ name: 'bookId', value: values.bookId });

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
          {isAdmin && (
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
          )}

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('status')}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AcceptedStatuses).map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(status.toLowerCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAdmin && (
            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('bookId')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('bookId')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
